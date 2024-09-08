$(document).ready(function() {
    let find = false;
    let currentScrollIndex = 0;
    let scroll = false;
    let rowsToScroll = [];
    let playerName = "";

    function highlightUserRow(jsonData) {
        if (scroll) rowsToScroll = [];
        $('#serversTableWarcaby tbody tr').each(function(index) {
            const $row = $(this);
            const serverIndex = $row.find('.button_spin').data('index');

            if ((jsonData[serverIndex] && jsonData[serverIndex].players === 1 && playerName == "") ||
                (jsonData[serverIndex] && jsonData[serverIndex].players === 1 && 
                (jsonData[serverIndex].user1 == playerName || jsonData[serverIndex].user2 == playerName)
                )) {
                $row.find('.joinWarcaby').addClass('green-border');
                if (scroll) rowsToScroll.push($row);
            } else {
                $row.find('.joinWarcaby').removeClass('green-border');
            }
        });
    }

    function scrollToNextRow() {
        if (currentScrollIndex >= rowsToScroll.length) {
            currentScrollIndex = 0;
        }

        const $nextRow = rowsToScroll[currentScrollIndex];
        const containerScrollTop = $('.table-container').scrollTop();
        const containerHeight = $('.table-container').height();
        const rowOffsetTop = $nextRow.offset().top - $('#serversTableWarcaby').offset().top;
        const rowHeight = $nextRow.outerHeight();

        const scrollTo = rowOffsetTop - (containerHeight / 2) + (rowHeight / 2);

        $('.table-container').animate({
            scrollTop: scrollTo
        }, 500);

        currentScrollIndex++;
    }

    $('#createServerWarcaby').on('click', function() {
        $.post('/create-serverWarcaby')
            .done(function(data) {
                $('tbody#warcabyTbody').append(`
                    <tr id="server-${data.index}">
                        <td class="server">SERVER ${data.index + 1}</td>
                        <td class="button_spin" data-index="${data.index}" data-players="${data.players}">
                            <button class="joinWarcaby button visible">JOIN</button>
                            <i class="icon-spin3 hidden"></i>
                        </td>
                        <td class="players">${data.user1}</td>
                        <td class="players">${data.user2}</td>
                    </tr>
                `);
                attachJoinHandlers();
                const $tableContainer = $('.table-container');
                $tableContainer.animate({
                    scrollTop: $tableContainer[0].scrollHeight
                }, 500);
            })
            .fail(function(error) {
                console.error('Error:', error);
            });
    });

    function updateServerList() {
        $.get('/servers-dataWarcaby')
            .done(function(jsonData) {
                var scrollPos = $(window).scrollTop();
                $('#serversTableWarcaby tbody').empty();

                jsonData.forEach((server, index) => {
                    let joinButton = 'FULL';
                    if (server.players < 2) {
                        joinButton = '<button class="joinWarcaby button visible">JOIN</button>';
                    }

                    $('#serversTableWarcaby tbody').append(`
                        <tr id="server-${index}">
                            <td class="server">SERVER ${index + 1}</td>
                            <td class="button_spin" data-index="${index}" data-players="${server.players}">
                                ${joinButton}
                                <i class="icon-spin3 hidden"></i>
                            </td>
                            <td class="players">${server.user1}</td>
                            <td class="players">${server.user2}</td>
                        </tr>
                    `);
                });

                scroll = false;

                if (find) {
                    highlightUserRow(jsonData);
                }
                attachJoinHandlers();
                $('.table-container').css('visibility', 'visible');
            })
            .fail(function(error) {
                console.error('Error updating server list:', error);
            });
    }

    function attachJoinHandlers() {
        $('.joinWarcaby').off('click').on('click', function(event) {
            event.preventDefault();
            const inputText = $('#yourNameWarcaby').val().trim();
            if (!inputText) {
                alert('Please enter text before joining a server.');
                return;
            }

            const $joinButton = $(this);
            $joinButton.prop('disabled', true);

            const serverJoin = $joinButton.closest('.button_spin');
            const serverIndex = serverJoin.data('index');

            $.get('/servers-dataWarcaby')
                .done(function(jsonData) {
                    const latestServerData = jsonData[serverIndex];

                    if (latestServerData.user1 === inputText || latestServerData.user2 === inputText) {
                        alert('You cannot use the same name as an existing player.');
                        $joinButton.prop('disabled', false);
                        return;
                    }

                    if (latestServerData.user1 === "") {
                        $.post('/submitWarcaby', { inputText: inputText, index: serverIndex })
                            .done(function(data) {
                                localStorage.setItem('serverData', JSON.stringify({
                                    inputText: inputText,
                                    index: serverIndex,
                                    players: data.players,
                                    player: 1
                                }));
                                window.location.href = '/warcaby';
                            })
                            .fail(function(error) {
                                console.error('Error:', error);
                                $joinButton.prop('disabled', false);
                            });
                    } else if (latestServerData.user2 === "" && latestServerData.block === 0) {
                        $.post('/submitWarcaby', { inputText: inputText, index: serverIndex })
                            .done(function(data) {
                                localStorage.setItem('serverData', JSON.stringify({
                                    inputText: inputText,
                                    index: serverIndex,
                                    players: data.players,
                                    player: 2
                                }));
                                window.location.href = '/warcaby';
                            })
                            .fail(function(error) {
                                console.error('Error:', error);
                                $joinButton.prop('disabled', false);
                            });
                    } else {
                        $joinButton.prop('disabled', false);
                        const $spinIcon = $joinButton.parent('.button_spin').find('.icon-spin3');
                        $joinButton.removeClass('visible');
                        $joinButton.addClass('hidden');
                        $spinIcon.removeClass('hidden');
                        $spinIcon.addClass('animate-spin');
                    }
                })
                .fail(function(error) {
                    console.error('Error fetching latest server data:', error);
                    $joinButton.prop('disabled', false);
                });
        });
    }

    updateServerList();

    $(document).on('click', '#find_playersWarcaby', function() {
        $.get('/findWarcaby')
            .done(function(jsonData) {
                find = true;
                scroll = true;
                highlightUserRow(jsonData);
                if (rowsToScroll.length > 0) scrollToNextRow();
            })
            .fail(function(error) {
                console.error('Error fetching player data:', error);
            });
    });

    const findPlayersButton = document.getElementById('find_playersWarcaby');
    findPlayersButton.addEventListener('click', () => {
        const playersNameWarcabyInput = document.getElementById('playersNameWarcaby');
        playerName = playersNameWarcabyInput.value.trim();
        console.log(`Player's name input: ${playerName}`);
    });

    setInterval(updateServerList, 5000);
});
