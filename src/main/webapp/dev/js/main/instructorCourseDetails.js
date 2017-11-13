import {
    showModalConfirmation,
} from '../common/bootboxWrapper';

import {
    StatusType,
} from '../common/const';

import {
    attachEventToDeleteStudentLink,
    attachEventToDeleteAllStudentLink,
    prepareInstructorPages,
    selectElementContents,
} from '../common/instructor';

import {
    toggleSort,
} from '../common/sortBy';

import {
    setStatusMessage,
} from '../common/statusMessage';

function submitFormAjax() {
    const formObject = $('#csvToHtmlForm');
    const formData = formObject.serialize();
    const content = $('#detailsTable');
    const ajaxStatus = $('#ajaxStatus');

    const retryButtonHtml = '<button class="btn btn-info" id="instructorCourseDetailsRetryButton"> retry</button>';
    $('#instructorCourseDetailsRetryButton').on('click', submitFormAjax);

    $.ajax({
        type: 'POST',
        url: `/page/instructorCourseDetailsPage?${formData}`,
        beforeSend() {
            content.html("<img src='/images/ajax-loader.gif'/>");
        },
        error() {
            ajaxStatus.html('Failed to load student table. Please try again.');
            content.html(retryButtonHtml);
        },
        success(data) {
            setTimeout(() => {
                if (data.isError) {
                    ajaxStatus.html(data.errorMessage);
                    content.html(retryButtonHtml);
                } else {
                    const table = data.studentListHtmlTableAsString;
                    content.html(`<small>${table}</small>`);
                }

                setStatusMessage(data.statusForAjax);
            }, 500);
        },
    });
}

function attachEventToRemindStudentsButton() {
    $('#button_remind').on('click', (event) => {
        const $clickedButton = $(event.target);
        const messageText = `${'Usually, there is no need to use this feature because TEAMMATES sends an automatic '
                          + 'invite to students at the opening time of each session. Send a join request to '
                          + 'all yet-to-join students in '}${$clickedButton.data('courseId')} anyway?`;
        const okCallback = function okCallback() {
            window.location = $clickedButton.attr('href');
        };

        showModalConfirmation('Confirm sending join requests', messageText, okCallback, null,
                null, null, StatusType.INFO);
    });
}

function attachEventToSendInviteLink() {
    $('.course-student-remind-link').on('click', (event) => {
        event.preventDefault();

        const $clickedLink = $(event.target);
        const messageText = 'Usually, there is no need to use this feature because TEAMMATES sends an automatic '
                          + 'invite to students at the opening time of each session. Send a join request anyway?';
        const okCallback = function okCallback() {
            $.get($clickedLink.attr('href'), () => {
                const studentEmail = $clickedLink.parent().siblings("td[id|='studentemail']").html().trim();
                const message = `An email has been sent to ${studentEmail}`;
                setStatusMessage(message, 'success');
            });
        };

        showModalConfirmation('Confirm sending join request', messageText, okCallback, null,
                null, null, StatusType.INFO);
    });
}

$(document).ready(() => {
    prepareInstructorPages();

    if ($('#button_sortstudentsection').length) {
        toggleSort($('#button_sortstudentsection'));
    } else {
        toggleSort($('#button_sortstudentteam'));
    }

    // auto select the html table when modal is shown
    $('#studentTableWindow').on('shown.bs.modal', () => {
        selectElementContents($('#detailsTable').get(0));
    });

    attachEventToRemindStudentsButton();
    attachEventToSendInviteLink();
    attachEventToDeleteStudentLink();
    attachEventToDeleteAllStudentLink();

    $('#btn-select-element-contents').on('click', () => {
        selectElementContents($('#detailsTable').get(0));
    });

    $('#btn-display-table').on('click', () => {
        submitFormAjax();
    });
});
