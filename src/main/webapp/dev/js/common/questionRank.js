import {
    ParamsNames,
} from './const';

function isRankOptionsQuestion(qnNumber) {
    return $(`#form_editquestion-${qnNumber}`).children('input[name="questiontype"]').val() === 'RANK_OPTIONS';
}

function isMinOptionsToBeRankedEnabled(qnNumber) {
    return isRankOptionsQuestion(qnNumber) ? $(`#minOptionsToBeRankedEnabled-${qnNumber}`).prop('checked')
            : $(`#minRecipientsToBeRankedEnabled-${qnNumber}`).prop('checked');
}

function isMaxOptionsToBeRankedEnabled(qnNumber) {
    return isRankOptionsQuestion(qnNumber) ? $(`#maxOptionsToBeRankedEnabled-${qnNumber}`).prop('checked')
            : $(`#maxRecipientsToBeRankedEnabled-${qnNumber}`).prop('checked');
}

function getNumOfRankOptions(qnNumber) {
    if (isRankOptionsQuestion(qnNumber)) {
        // for rank options question, return number of options
        return $(`#rankOptionTable-${qnNumber}`).children('div[id^="rankOptionRow"]').length;
    }

    // for rank recipients question, compute the number of recipients
    const recipient = $(`#recipienttype-${qnNumber}`).val();

    switch (recipient) {
    case 'STUDENTS':
    case 'INSTRUCTORS':
    case 'TEAMS':
        return $(`#num-${recipient.toLowerCase()}`).val();
    case 'OWN_TEAM_MEMBERS':
    case 'OWN_TEAM_MEMBERS_INCLUDING_SELF':
        // returning infinite as this is dependent on team size
        return Number.MAX_SAFE_INTEGER;
    default:
        // other recipient types like NONE, SELF have only 1 recipient
        return 1;
    }
}

function getMinOptionsToBeRankedBox(qnNumber) {
    return isRankOptionsQuestion(qnNumber) ? $(`#minOptionsToBeRanked-${qnNumber}`)
            : $(`#minRecipientsToBeRanked-${qnNumber}`);
}

function getMaxOptionsToBeRankedBox(qnNumber) {
    return isRankOptionsQuestion(qnNumber) ? $(`#maxOptionsToBeRanked-${qnNumber}`)
            : $(`#maxRecipientsToBeRanked-${qnNumber}`);
}

function setUpperLimitForMinOptionsToBeRanked(qnNumber, upperLimit) {
    getMinOptionsToBeRankedBox(qnNumber).prop('max', upperLimit);
}

function setUpperLimitForMaxOptionsToBeRanked(qnNumber, upperLimit) {
    getMaxOptionsToBeRankedBox(qnNumber).prop('max', upperLimit);
}

function getMinOptionsToBeRanked(qnNumber) {
    if (isMinOptionsToBeRankedEnabled(qnNumber)) {
        return parseInt(getMinOptionsToBeRankedBox(qnNumber).val(), 10);
    }

    return Number.MAX_SAFE_INTEGER;
}

function getMaxOptionsToBeRanked(qnNumber) {
    if (isMaxOptionsToBeRankedEnabled(qnNumber)) {
        return parseInt(getMaxOptionsToBeRankedBox(qnNumber).val(), 10);
    }

    return Number.MAX_SAFE_INTEGER;
}

function setMinOptionsToBeRanked(qnNumber, newVal) {
    if (!isMinOptionsToBeRankedEnabled(qnNumber) || newVal < 1) {
        return;
    }

    getMinOptionsToBeRankedBox(qnNumber).val(newVal);
}

function setMaxOptionsToBeRanked(qnNumber, newVal) {
    if (!isMaxOptionsToBeRankedEnabled(qnNumber) || newVal < 1) {
        return;
    }

    getMaxOptionsToBeRankedBox(qnNumber).val(newVal);
}

function adjustMinOptionsToBeRanked(qnNumber) {
    if (!isMinOptionsToBeRankedEnabled(qnNumber)) {
        return;
    }

    const upperLimit = getNumOfRankOptions(qnNumber);
    const currentVal = Math.min(getMinOptionsToBeRanked(qnNumber), upperLimit);

    setUpperLimitForMinOptionsToBeRanked(qnNumber, upperLimit);
    setMinOptionsToBeRanked(qnNumber, currentVal);

    if (getMaxOptionsToBeRanked(qnNumber) < currentVal) {
        setMaxOptionsToBeRanked(qnNumber, currentVal);
    }
}

function adjustMaxOptionsToBeRanked(qnNumber) {
    if (!isMaxOptionsToBeRankedEnabled(qnNumber)) {
        return;
    }

    const upperLimit = getNumOfRankOptions(qnNumber);
    const currentVal = Math.min(getMaxOptionsToBeRanked(qnNumber), upperLimit);

    setUpperLimitForMaxOptionsToBeRanked(qnNumber, upperLimit);
    setMaxOptionsToBeRanked(qnNumber, currentVal);

    if (currentVal < getMinOptionsToBeRanked(qnNumber)) {
        setMinOptionsToBeRanked(qnNumber, currentVal);
    }
}

function adjustMinMaxOptionsToBeRanked(qnNumber) {
    adjustMaxOptionsToBeRanked(qnNumber);
    adjustMinOptionsToBeRanked(qnNumber);
}

function toggleMinOptionsToBeRanked(qnNumber) {
    const $maxOptionsToBeRanked = getMinOptionsToBeRankedBox(qnNumber);

    $maxOptionsToBeRanked.prop('disabled', !isMinOptionsToBeRankedEnabled(qnNumber));
    adjustMinMaxOptionsToBeRanked(qnNumber);
}

function toggleMaxOptionsToBeRanked(qnNumber) {
    const $maxOptionsToBeRanked = getMaxOptionsToBeRankedBox(qnNumber);

    $maxOptionsToBeRanked.prop('disabled', !isMaxOptionsToBeRankedEnabled(qnNumber));
    adjustMinMaxOptionsToBeRanked(qnNumber);
}

function addRankOption(questionNum) {
    const questionId = `#form_editquestion-${questionNum}`;

    const curNumberOfChoiceCreated =
            parseInt($(`#${ParamsNames.FEEDBACK_QUESTION_NUMBEROFCHOICECREATED}-${questionNum}`).val(), 10);

    $(`
    <div class="margin-bottom-7px" id="rankOptionRow-${curNumberOfChoiceCreated}-${questionNum}">
        <div class="input-group">
            <input type="text" name="${ParamsNames.FEEDBACK_QUESTION_RANKOPTION}-${curNumberOfChoiceCreated}"
                    id="${ParamsNames.FEEDBACK_QUESTION_RANKOPTION}-${curNumberOfChoiceCreated}-${questionNum}"
                    class="form-control rankOptionTextBox">
            <span class="input-group-btn">
                <button class="btn btn-default removeOptionLink" id="rankRemoveOptionLink"
                        onclick="removeRankOption(${curNumberOfChoiceCreated}, ${questionNum})" tabindex="-1">
                    <span class="glyphicon glyphicon-remove"></span>
                </button>
            </span>
        </div>
    </div>
    `).insertBefore($(`#rankAddOptionRow-${questionNum}`));

    $(`#${ParamsNames.FEEDBACK_QUESTION_NUMBEROFCHOICECREATED}-${questionNum}`).val(curNumberOfChoiceCreated + 1);

    if ($(questionId).attr('editStatus') === 'hasResponses') {
        $(questionId).attr('editStatus', 'mustDeleteResponses');
    }

    adjustMinMaxOptionsToBeRanked(questionNum);
}

function hideRankOptionTable(questionNum) {
    $(`#${ParamsNames.FEEDBACK_QUESTION_RANKOPTIONTABLE}-${questionNum}`).hide();
}

function removeRankOption(index, questionNum) {
    const questionId = `#form_editquestion-${questionNum}`;
    const $thisRow = $(`#rankOptionRow-${index}-${questionNum}`);

    // count number of child rows the table have and - 1 because of 'add option' button
    const numberOfOptions = $thisRow.parent().children('div').length - 1;

    if (numberOfOptions <= 2) {
        $thisRow.find('input').val('');
    } else {
        $thisRow.remove();

        if ($(questionId).attr('editStatus') === 'hasResponses') {
            $(questionId).attr('editStatus', 'mustDeleteResponses');
        }
    }

    adjustMinMaxOptionsToBeRanked(questionNum);
}

function bindRankEvents() {
    $(document).on('change', 'input[name="minOptionsToBeRanked"],input[name="minRecipientsToBeRanked"]', (e) => {
        const questionNum = $(e.target).closest('form').attr('data-qnnumber');
        adjustMinOptionsToBeRanked(questionNum);
    });

    $(document).on('change', 'input[name="maxOptionsToBeRanked"],input[name="maxRecipientsToBeRanked"]', (e) => {
        const questionNum = $(e.target).closest('form').attr('data-qnnumber');
        adjustMaxOptionsToBeRanked(questionNum);
    });

    $(document).on('change',
            'input[name="minOptionsToBeRankedEnabled"],input[name="minRecipientsToBeRankedEnabled"]', (e) => {
                const questionNum = $(e.target).closest('form').attr('data-qnnumber');
                toggleMinOptionsToBeRanked(questionNum);
            });

    $(document).on('change',
            'input[name="maxOptionsToBeRankedEnabled"],input[name="maxRecipientsToBeRankedEnabled"]', (e) => {
                const questionNum = $(e.target).closest('form').attr('data-qnnumber');
                toggleMaxOptionsToBeRanked(questionNum);
            });
}

export {
    addRankOption,
    bindRankEvents,
    hideRankOptionTable,
    removeRankOption,
    toggleMaxOptionsToBeRanked,
    toggleMinOptionsToBeRanked,
};
