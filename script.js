const constants = {
    months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    eventFormId: 'eventForm',
    eventListId: 'eventList',
    eventStartId: 'eventStart',
    eventEndId: 'eventEnd',
    eventIsAllDay: 'allDay',
    eventStartDefault: '08:00',
    eventEndDefault: '09:00', 
    searchFormId: 'searchForm',
    currentYearKey: 'currentYear',
    submitEvent: 'submit',
    onclickEvent: 'onClick',
    onchangeEvent: 'onChange',
    preventDefault: 'javascript:void(0)',
    currentYearElement: 'year',
    tableTag: 'table',
    tbodyTag: 'tbody',
    trTag: 'tr',
    tdTag: 'td',
    elementId: 'id',
    aTag : 'a',
    aNode: 'A',
    inputNode: 'INPUT',
    todayId: 'today',
    spanTag: 'span',
    spanNode: 'SPAN',
    searchModalId: 'searchModal',
    eventModalId: 'eventModal',
    eventDataListId: 'eventDataList',
    eventListNameField: 'Name',
    eventListDescriptionField: 'Description',
    eventListDateField: 'Date',
    eventListStartField: 'Start Time',
    eventListEndField: 'End Time',
    eventListAllDayField: 'Is All Day Event?',
    editEventIdPrefix: 'edit_',
    deleteEventIdPrefix: 'delete_',
    editStartTimeInputIdSuffix: 'startTime',
    editEndTimeInputIdSuffix:'endTime',
    overlapModalId: 'overlapModal',
    overlapConfirmationButtonId: 'overlapConfirmation',
    modalBackgroundId: 'modalBg',
    overlapModalBackgroundId: 'overlapModalBg',
    searchValueId: 'searchValue',
    searchDateId: 'searchDate',
    eventDataContainerId: 'eventData',
    searchResultDataListId: 'resultDataList',
    resultListContainerId: 'resultList',
    resultMessageId: 'resultMessage',
    emWhitespace: '&emsp;',
    firstDayOfYear: '01/01/',
    lastDayOfYear: '12/31/',
    displayBlock: 'block',
    displayFlex: 'flex',
    displayNone: 'none',
    initialOverflow: 'initial',
    searchByDateModeId: 'searchByDate',
    searchByNameModeId: 'searchByName',
    nameValidationResultId: 'nameValidationResult',
    timeValidationResultId: 'timeValidationResult',
    editValidationResultId: 'EditValidationResult',
    eventDataTimeValidationResultId: 'eventDataTimeValidationResult',
    eventDataNameValidationResultId: 'eventDataNameValidationResult',
    searchResultTimeValidationResultId: 'searchResultTimeValidationResult',
    searchResultNameValidationResultId: 'searchResultNameValidationResult',
    validationResultSpanIdSuffix: 'ValidationResult',
    contentTypeCsv: 'text/csv',
    csvExportFilename: 'export.csv',
    checkboxContentRegex: new RegExp('^(true|false)$','i'),
    inputTypeAttribute: 'type',
    inputTypeCheckbox: 'checkbox',
    inputTypeTime: 'Time',
    inputElement: 'input',
    viewEventsMode: 'view',
    addNewEventMode: 'add',
    eventIdDieldDelimiter: '_',
    dateStrDelimiter: '-',
    timeStrDelimiter: ':',
    errorMsgColor: 'red',
    timeValidationMsgColor: 'gray'
};

const icons = {
    editIcon : '\u{270E}',
    deleteIcon : '\u{1F5D1}',
    confirmIcon : '\u{2714}',
    cancelIcon : '\u{2716}',
    warningIcon : '\u{26A0}',
};

const cssClasses = {
    textSpan : 'text-span',
    whitespaceSpan : 'whitespace-span',
    glyphIcon : 'glyphIcon',
    validationResult: 'validationResult',
    currentEvents: 'currentEvents',
    eventDataListEmpty: 'eventDataListEmpty'
}

const validationMessages = {
    noEventsFound: 'No events found for given search criteria',
    overlappingWithAllDayEvent: ' The event is overlapping with the existing all day event ',
    overlappingWithExistingEvent: 'The event is overlapping with the existing event ',
    emptyEventName: 'The name of the event cannot be empty',
    theNameIsAlreadyInUse: 'The name is already in use by another event',
    invalidStartEndTime: '&nbsp;Invalid start/end time: '
}

const events = Object.keys(localStorage).reduce(function(obj, key) {
    obj[key] = localStorage.getItem(key);
    return obj;
 }, {});

let form = document.getElementById(constants.eventFormId);
let searchForm = document.getElementById(constants.searchFormId);
let currentYearFromStorage = localStorage.getItem(constants.currentYearKey);

form.addEventListener(constants.submitEvent, function(event) {event.preventDefault();});
searchForm.addEventListener(constants.submitEvent, function(event) {event.preventDefault();});

class CalendarEvent
{
    constructor(name, description, date, start, end, allDay)
    {
        this.name = name;
        this.description = description != undefined && description != null ? description:'';
        this.date = date;
        this.start = start;
        this.end = end;
        this.allDay = allDay;
    }
}

class TimeRange
{
    constructor(startHour, startMinutes, endHour, endMinutes)
    {
        this.startHour = startHour;
        this.startMinutes = startMinutes;
        this.endHour = endHour;
        this.endMinutes = endMinutes;
    }

    /**
     * @returns A list containing the hours that are covered by the TimeRange of an event.
     */
    calculateHourRange()
    {
        let hoursCovered = new Array();
        for(let i=this.startHour; i<=this.endHour; i++)
        {
            hoursCovered.push(i);
        }

        return hoursCovered;
    }
}

/**
 * Creates the tables for the months and populates them by calling the appendDay function
 * @param {*} currentDate - The current date (used to define the year that will be used when the year changes)
 */
function getDates(currentDate)
{
    if(currentDate!=undefined)
    {
        clearDates();
    }

    if(currentDate===undefined && currentYearFromStorage!=undefined)
    {
        currentDate = new Date(constants.firstDayOfYear+currentYearFromStorage);
    }

    let date = currentDate!=undefined ? currentDate : Date.now();
    date = new Date(date);

    if(currentYearFromStorage===undefined || currentYearFromStorage === null || currentYearFromStorage==='')
    {
        currentYear = date.getFullYear();
        localStorage.setItem(constants.currentYearKey, currentYear);
    }

    document.getElementById(constants.currentYearElement).innerHTML=date.getFullYear();
    const days = getDaysOfYear(date.getFullYear());

    for(const key in days)
    {
        const currentDay = days[key];
        
        let currentMonth = currentDay.getMonth();

        let table = document.getElementById(constants.months[currentMonth]);
        let tBody = table.getElementsByTagName(constants.tbodyTag)[0];
        
        if(currentDay.getDate()==1 || currentDay.getDate()==8 || currentDay.getDate()==15 || currentDay.getDate()==22 || currentDay.getDate()==29)
        {
            let tr = document.createElement(constants.trTag);
            if(currentDay.getDate()==1)
            {
                tr.setAttribute(constants.elementId, constants.months[currentMonth]+0);
            }
            else if(currentDay.getDate()==8)
            {
                tr.setAttribute(constants.elementId, constants.months[currentMonth]+1);
            }
            else if(currentDay.getDate()==15)
            {
                tr.setAttribute(constants.elementId, constants.months[currentMonth]+2);
            }
            else if(currentDay.getDate()==22)
            {
                tr.setAttribute(constants.elementId, constants.months[currentMonth]+3);
            }
            else
            {
                tr.setAttribute(constants.elementId, constants.months[currentMonth]+4);
            }
            
            let td = document.createElement(constants.tdTag);
            appendDay(td, currentDay);
            tr.appendChild(td);
            tBody.appendChild(tr);
        }
        else if(currentDay.getDate()==7 || currentDay.getDate()==14 || currentDay.getDate()==21 || currentDay.getDate()==28 || currentDay.getDate()==31)
        {
            let td = document.createElement(constants.tdTag);

            let table = document.getElementById(constants.months[currentMonth]);
            let tbody = table.getElementsByTagName(constants.tbodyTag);

            if(currentDay.getDate()>=1 && currentDay.getDate()<8)
            {
                tr = document.getElementById(constants.months[currentMonth]+0);
            }
            else if(currentDay.getDate()>=8 && currentDay.getDate()<15)
            {
                tr = document.getElementById(constants.months[currentMonth]+1);
            }
            else if(currentDay.getDate()>=15 && currentDay.getDate()<22)
            {
                tr = document.getElementById(constants.months[currentMonth]+2);
            }
            else if(currentDay.getDate()>=22 && currentDay.getDate()<29)
            {
                tr = document.getElementById(constants.months[currentMonth]+3);
            }
            else
            {
                tr = document.getElementById(constants.months[currentMonth]+4);
            }

            appendDay(td, currentDay);
            tr.appendChild(td);
        }
        else
        {
            let table = document.getElementById(constants.months[currentMonth]);
            let tr;

            if(currentDay.getDate()>=1 && currentDay.getDate()<8)
            {
                tr = document.getElementById(constants.months[currentMonth]+0);
            }
            else if(currentDay.getDate()>=8 && currentDay.getDate()<15)
            {
                tr = document.getElementById(constants.months[currentMonth]+1);
            }
            else if(currentDay.getDate()>=15 && currentDay.getDate()<22)
            {
                tr = document.getElementById(constants.months[currentMonth]+2);
            }
            else if(currentDay.getDate()>=22 && currentDay.getDate()<29)
            {
                tr = document.getElementById(constants.months[currentMonth]+3);
            }
            else
            {
                tr = document.getElementById(constants.months[currentMonth]+4);
            }
            
            let td = document.createElement(constants.tdTag);

            appendDay(td, currentDay);
            tr.appendChild(td);
        }
    }
}

/**
 * Adds a new day to the given table cell
 * @param {*} td - The cell to be populated
 * @param {*} day - The value that is added to the cell
 */
function appendDay(td, day)
{
    let a = document.createElement(constants.aTag);
    a.textContent = day.getDate();
    a.href = constants.preventDefault;
    a.setAttribute(constants.onclickEvent,"showModal('"+day+"', false)");
    td.appendChild(a);

    const evt = getEventCount(day);

    let eventCount = document.createElement(constants.aTag);
    
    if(evt.size>0)
    {
        eventCount.textContent += ''+evt.size;
        eventCount.className = cssClasses.textSpan;
        eventCount.href = constants.preventDefault;
        eventCount.setAttribute(constants.onclickEvent,"showModal('"+day+"', true)");
    }
    else
    {
        eventCount.textContent += '\n';
        eventCount.innerHTML+= constants.emWhitespace;
        eventCount.className = cssClasses.whitespaceSpan;
    }

    td.appendChild(eventCount);

    if(isToday(day))
    {
        td.id = constants.todayId;
    }
}

/**
 * 
 * @param {*} date 
 * @returns wether the given day matches with the current one
 */
function isToday(date)
{
    const today = new Date(Date.now());

    if(today.getDate() === date.getDate()
    && today.getMonth() === date.getMonth()
    && today.getUTCFullYear() === date.getUTCFullYear())
    {
        return true;
    }

    return false;
}

/**
 * Clears the dates of each month
 */
function clearDates()
{
    for(let i=0;i<12;i++)
    {
        let table = document.getElementById(constants.months[i]);
        let tBody = table.getElementsByTagName(constants.tbodyTag)[0];
        const childElementCount = tBody.childElementCount;

        for(let i=0;i<childElementCount;i++)
        {
            tBody.deleteRow(0);
        }
    }
}

/**
 * @param {*} year 
 * @returns A list containing all the dates of the given year
 */
function getDaysOfYear(year)
{
    let days = new Array();
    const initDate = new Date(constants.firstDayOfYear+year);
    const lastDate = new Date(constants.lastDayOfYear+year)

    let currentDate = new Date((initDate.getMonth()+1)+'/'+initDate.getDate()+'/'+initDate.getFullYear());

    days.push(initDate);
    while(currentDate<lastDate)
    {
        let dateToAdd = new Date(currentDate.getTime());   
        dateToAdd.setDate(currentDate.getDate()+1);
        
        days.push(dateToAdd);
        currentDate.setDate(currentDate.getDate()+1);
    }

    return days;
}

/**
 * Retrieves the dates for the next/previous year
 * @param {*} isNext - Flag that denotes if the next year should be returned, otherwise the dates of 
 * the previous year will be retrieved. 
 */
function getOtherYear(isNext)
{
    let current = Number(document.getElementById(constants.currentYearElement).innerHTML);
    let year;

    if(isNext)
    {
        year = Number(current+=1);
    }
    else
    {
        year = Number(current-=1);
        if(year<1970)
        {
            return 1970;
        }
    }

    let nextYearDate = new Date(constants.firstDayOfYear+year);
    localStorage.setItem(constants.currentYearKey, year);

    getDates(nextYearDate);
}

/**
 * Shows the new event submission window for the current day
 */
function addNew()
{
    const today = new Date(Date.now());
    showModal(today);
}

/**
 * Toggles the visibility of the search modal
 */
function search()
{
    document.getElementById(constants.searchModalId).style.display = constants.displayBlock;
    document.getElementById(constants.modalBackgroundId).style.display=constants.displayFlex;
    document.getElementById(constants.searchByDateModeId).checked = true;
    change(true);
}

function exportToCSV()
{
    let output = '';
    let isFirst = true;

    for(const eventId in events)
    {
        const event = JSON.parse(localStorage.getItem(eventId));
        const eventKeys = Object.keys(event);
        const keyLength = eventKeys.length;

        for(let key=0; key<keyLength; key++)
        {
            if(isFirst)
            {
                output += eventKeys+'\n';
                isFirst = false;
            }

            let value = event[eventKeys[key]];
            if(value.length==0)
            {
                value = ' ';
            }

            output+=value;

            if(key == eventKeys.length-1)
            {
                output+='\n';
            }
            else
            {
                output+=',';
            }
        }        
    }

    const blob = new Blob([output], {type:constants.contentTypeCsv});
    const url = URL.createObjectURL(blob);
    const a = document.createElement(constants.aTag);
    
    a.href = url;
    a.download = constants.csvExportFilename;
    a.click();
}

/**
 * Toggles the event search modal filter functionality.
 * @param {*} isSearchByDate - Flag that denotes if the event(s) should be searched on their startDate. Otherwise,
 * the event(s) will be searched by name
 */
function change(isSearchByDate)
{
    let searchValue = document.getElementById(constants.searchValueId);
    let searchDate = document.getElementById(constants.searchDateId);

    resetList(constants.searchResultDataListId);
    document.getElementById(constants.resultListContainerId).style.display = constants.displayNone;
    document.getElementById(constants.resultMessageId).innerHTML = '';
    document.getElementById(constants.searchValueId).value = '';
    document.getElementById(constants.searchDateId).value  = '';

    if(isSearchByDate)
    {
       searchValue.style.display = constants.displayNone;
       searchDate.style.display = constants.displayFlex;
    }
    else
    {
        searchValue.style.display = constants.displayFlex;
        searchDate.style.display = constants.displayNone;
    }
}

/**
 * Searches the browser's local storage for the events that match the given search criteria.
 * @param {*} searchValue - The value to search
 * @param {*} byName - Flag that denotes if the event(s) should be searched by name. Otherwise,
 * the event(s) will be searched by startDate
 * @returns A list of the events that match the search criteria.
 */
function searchEventBy(searchValue, byName)
{
    let results = [];
    Object.keys(localStorage).find(function(key) {
        let obj = localStorage.getItem(key);
        const event = JSON.parse(obj);
        
        if(byName)
        {
            if(event.name === searchValue)
            {
                results.push(key);
            }
        }
        else
        {
            if(event.date === searchValue)
            {
                results.push(key);
            }
        }

     });

     return results;
}

/**
 * Toggles the visibility of the search event modal.
 */
function searchEvent()
{
    resetList(constants.searchResultDataListId);
    const searchByDate = document.getElementById(constants.searchByDateModeId).checked;
    const searchByName = document.getElementById(constants.searchByNameModeId).checked;
    let searchValue;
    let results;

    if(searchByName)
    {
        searchValue = document.getElementById(constants.searchValueId).value;
        results = searchEventBy(searchValue, true);
    }
    else if(searchByDate)
    {
        searchValue = document.getElementById(constants.searchDateId).value;
        results = searchEventBy(searchValue, false);
    }

    if(results!=undefined && results.length>0)
    {
        document.getElementById(constants.resultMessageId).innerHTML = '';
        results.forEach(result => {
            const event = getEventById(result);
            let row = document.createElement(constants.trTag);
            row.id = getEventId(event);
            addElementToTable(event, row, constants.searchResultDataListId);
        });
    }
    else
    {
        document.getElementById(constants.resultMessageId).innerHTML = validationMessages.noEventsFound;
    }

}

/**
 * Adds a new event to the given table
 * @param {*} event - The CalendarEvent object to be added to the table
 * @param {*} row - The row that will be appended to the table
 * @param {*} tableId - The id of the table
 */
function addElementToTable(event, row, tableId)
{
    let table = document.getElementById(tableId);
    let isSearchResult = false;
    
    if(tableId === constants.searchResultDataListId)
    {
        document.getElementById(constants.resultListContainerId).style.display=constants.displayFlex;
        isSearchResult = true;
    }

    if(table!=undefined)
    {
        for(const key in event)
        {
            const currentValue = event[key];
            let td = document.createElement(constants.tdTag);
            let value;
            
            if(constants.checkboxContentRegex.test(currentValue))
            {
                value = document.createElement(constants.inputElement);
                value.setAttribute(constants.inputTypeAttribute,constants.inputTypeCheckbox);

                value.checked = currentValue;
                value.disabled = true;
            }
            else
            {
                value = document.createElement(constants.spanTag);
                value.textContent = currentValue;
            }
        
            td.appendChild(value);
            row.append(td);
        }
        
        addOptions(event, row, isSearchResult);

        let tbody = table.getElementsByTagName(constants.tbodyTag)[0];
        tbody.appendChild(row);
    }
}

/**
 * Toggles the visibility of the new event/saved events modal
 * @param {*} date - The date of the event
 * @param {*} viewEvents - Flag that denotes if the view mode should be enabled.
 */
function showModal(date, viewEvents)
{
    document.getElementById(constants.eventModalId).style.display=constants.displayBlock;
    document.getElementById(constants.modalBackgroundId).style.display=constants.displayFlex;
    
    let modal = document.getElementById(constants.eventModalId);
    modal.style.overflow = constants.initialOverflow;

    let form = document.getElementById(constants.eventFormId);
    let eventDate = new Date(date);

    const day = eventDate.getDate()>9 ? eventDate.getDate() : '0'+eventDate.getDate();
    const month = (eventDate.getMonth()+1)>9 ? eventDate.getMonth()+1 : '0'+(eventDate.getMonth()+1);

    form.eventDate.value = eventDate.getFullYear() + constants.dateStrDelimiter + month + constants.dateStrDelimiter + day;
    const now = new Date();

    if(now.getHours()+1 > 23)
    {
        form.eventStart.value = now.getHours() + constants.timeStrDelimiter + (now.getMinutes()<10 ? '0' + now.getMinutes() : now.getMinutes());
        form.eventEnd.value = '23' + constants.timeStrDelimiter + '59';
    }
    else
    {
        if(now.getHours()<10)
        {
            form.eventStart.value = '0' + now.getHours() + constants.timeStrDelimiter + (now.getMinutes()<10 ? '0' + now.getMinutes() : now.getMinutes());
            form.eventEnd.value = '0' + (now.getHours()+1) + constants.timeStrDelimiter + (now.getMinutes()<10 ? '0' + now.getMinutes() : now.getMinutes());
        } 
        else
        {
            form.eventStart.value = now.getHours() + constants.timeStrDelimiter + (now.getMinutes()<10 ? '0' + now.getMinutes() : now.getMinutes());
            form.eventEnd.value = now.getHours()+1 + constants.timeStrDelimiter+(now.getMinutes()<10 ? '0' + now.getMinutes() : now.getMinutes());
        }
    }

    if(viewEvents)
    {
        switchTab(constants.viewEventsMode);
    }
}

/**
 * @param {*} date 
 * @returns the given date in YYYY/MM/DD format
 */
function formatDate(date)
{
    let eventDate = new Date(date);

    const day = eventDate.getDate()>9 ? eventDate.getDate() : '0'+eventDate.getDate();
    const month = (eventDate.getMonth()+1)>9 ? eventDate.getMonth()+1 : '0'+(eventDate.getMonth()+1);
    
    return eventDate.getFullYear() + constants.dateStrDelimiter + month + constants.dateStrDelimiter + day;
}

/**
 * @param {*} date - The date to retrieve the event count
 * @returns The count of events for a given date
 */
function getEventCount(date)
{
    let eventDate = formatDate(date);
    const eventsForDay = new Map();
    let c = 0;

    for(const key in events)
    {
        let currentKey = key;
        const retrievedDate = currentKey.substring(0, currentKey.indexOf(constants.eventIdDieldDelimiter));
        
        if(retrievedDate === eventDate)
        {
            eventsForDay.set(c, key);
        }
        c++;
    }

     return eventsForDay;
}

/**
 * Creates a new TimeRange object for a given calendar event.
 * @param {*} event - A CalendarEvent object
 * @returns a TimeRange object that contains the hours that are covered by the given event
 */
function timestampToTimeRange(event)
{
    const startHour = Number(event.start.split(constants.timeStrDelimiter)[0]);
    const startMinutes = Number(event.start.split(constants.timeStrDelimiter)[1]);
    const endHour = Number(event.end.split(constants.timeStrDelimiter)[0]);
    const endMinutes = Number(event.end.split(constants.timeStrDelimiter)[1]);
    return new TimeRange(startHour, startMinutes, endHour, endMinutes);
}

/**
 * Retrieves all the events for a given date.
 * @param {*} date - The date to retrieve the events
 * @returns a list containing the found events, sorted by the event timestamp values
 */
function getAllEventsForDay(date)
{
    let eventDate = formatDate(date);

    let foundEvents = [];
    for(const key in events)
    {
       let currentKey = key;
       const retrievedDate = currentKey.substring(0, key.indexOf(constants.eventIdDieldDelimiter));
       
       if(retrievedDate===eventDate)
       {
           const current = events[key];
           foundEvents.push(current);
       }
    }
    
    if(foundEvents.length>1)
    {
        foundEvents.sort(function(x, y){
            const event1 = JSON.parse(x);
            const event2 = JSON.parse(y);
            const timeRange1 = timestampToTimeRange(event1);
            const timeRange2 = timestampToTimeRange(event2);
    
            if (timeRange1.startHour < timeRange2.startHour) 
            {
                return -1;
            }
            else if (timeRange1.startHour > timeRange2.startHour)
            {
                return 1;
            } 
            else if (timeRange1.startMinutes < timeRange2.startMinutes)
            {
                return -1;
            } 
            else if (timeRange1.startMinutes > timeRange2.startMinutes)
            {
                return 1;
            }
            else
            {
                if (timeRange1.endMinutes < timeRange2.endMinutes) 
                {
                    return -1;
                }
                else if (timeRange1.endMinutes > timeRange2.endMinutes)
                {
                    return 1;
                } 
            }

            return 0;
        
        });
    }

    return foundEvents;
}

function getEventById(id)
{
    let event;
    if(id in events)
    {
        event=JSON.parse(events[id]);
    }

    return event;
}

function deleteEventFromStorage(eventId)
{
    localStorage.removeItem(eventId);
}

function saveEvent(calendarEvent)
{
    localStorage.setItem(calendarEvent.date + constants.eventIdDieldDelimiter + calendarEvent.start + constants.eventIdDieldDelimiter + calendarEvent.name, JSON.stringify(calendarEvent));
}

/**
 * Saves a new event if the submitted data are valid, otherwise the corresponding error message is returned to the event submission form.
 * @param {*} skipOverlapValidation - Flag that denotes if the overlappping event validation should be skipped (on overlapping event submission confirmation).
 */
function submitEvent(skipOverlapValidation)
{
    const formData = document.getElementById(constants.eventFormId);
    let event = new CalendarEvent(formData.eventName.value, formData.eventDesc.value, formData.eventDate.value, formData.eventStart.value, formData.eventEnd.value, formData.allDay.checked);
    const eventId = getEventId(event);

    if(validateForm(formData.eventName.value, formData.eventDate.value, formData.eventStart.value, formData.eventEnd.value, false, false, eventId))
    {
        if(skipOverlapValidation===undefined)
        {
            skipOverlapValidation = false;
        }

        if(!skipOverlapValidation)
        {
            if((document.getElementById(constants.timeValidationResultId).innerHTML==='' && document.getElementById(constants.eventDataTimeValidationResultId).innerHTML===''))
            {
                localStorage.setItem(formData.eventDate.value + constants.eventIdDieldDelimiter + formData.eventStart.value + constants.eventIdDieldDelimiter + formData.eventName.value, JSON.stringify(event));
                closeModal();
                closeConfirmationModal();
                document.location.reload();
                document.getElementById(constants.overlapModalBackgroundId).style.display = constants.displayNone;
            }
            else
            {
                document.getElementById(constants.overlapModalId).style.display = constants.displayFlex;
                document.getElementById(constants.overlapModalBackgroundId).style.display = constants.displayFlex;
            }
        }
        else
        {
            localStorage.setItem(formData.eventDate.value + constants.eventIdDieldDelimiter + formData.eventStart.value + constants.eventIdDieldDelimiter + formData.eventName.value, JSON.stringify(event));
            closeModal();
            closeConfirmationModal();
            document.location.reload();
        }
    }
}

/**
 * Closes the overlapping event confirmation modal
 */
function closeConfirmationModal()
{
    document.getElementById(constants.overlapModalId).style.display = constants.displayNone;
    document.getElementById(constants.overlapModalBackgroundId).style.display = constants.displayNone;
}

/**
 * Validates the input data of the event submission forms.
 * @param {*} eventName - The name of the event
 * @param {*} eventDate - The date that the event is scheduled
 * @param {*} eventStart - The event's starting time
 * @param {*} eventEnd - The event's ending time
 * @param {*} isEdit - Flag that denotes if the input data originate from the event edit form
 * @param {*} isSearch - Flag that denotes if the input data originate from the event edit form of the search functionality
 * @param {*} eventId - The id of the modified event
 * @returns 
 */
function validateForm(eventName, eventDate, eventStart, eventEnd, isEdit, isSearch, eventId)
{
    const currentEventData = getEventById(eventId);
    
    if(eventName===undefined || eventName===null || eventName==='')
    {
        const msg = validationMessages.emptyEventName;
        
        if(isSearch)
        {
            document.getElementById(constants.searchResultNameValidationResultId).innerHTML = msg;
        }
        else
        {
            if(isEdit)
            {
                document.getElementById(constants.eventDataNameValidationResultId).innerHTML = msg;
            }
            else
            {
                document.getElementById(constants.nameValidationResultId).innerHTML = msg;
            }
        }
 
        return false;
    }

    const existing = searchEventBy(eventDate, false);
    if(existing.length>0)
    {
        const sameNameAndDate = existing.filter((existingEvent)=>{
            const sameName = (existingEvent.substring(existingEvent.lastIndexOf(constants.eventIdDieldDelimiter)+1) === eventName);
            const sameDate = (existingEvent.substring(0, existingEvent.indexOf(constants.eventIdDieldDelimiter)) == eventDate);
            return sameName && sameDate;
        });
        
        nameNotUpdated = false;
        if(currentEventData!=undefined)
        {
            if(currentEventData.name == eventName)
            {
                nameNotUpdated = true;
            }
        }

        if((sameNameAndDate.length>0 && (((isEdit == true && !nameNotUpdated)) || (isEdit == false))))
        {

            if(isEdit==true && isSearch == false && !nameNotUpdated)
            {
                document.getElementById(constants.eventDataNameValidationResultId).innerHTML = validationMessages.theNameIsAlreadyInUse;
            }
            else if(isEdit==true && isSearch == true && !nameNotUpdated)
            {
                document.getElementById(constants.searchResultNameValidationResultId).innerHTML = validationMessages.theNameIsAlreadyInUse;
            }
            else if(isEdit==true && isSearch == true && nameNotUpdated)
            {
                document.getElementById(constants.searchResultNameValidationResultId).innerHTML = validationMessages.theNameIsAlreadyInUse;
            }
            else if(isEdit == false)
            {
                document.getElementById(constants.nameValidationResultId).innerHTML = validationMessages.theNameIsAlreadyInUse;
            }

            return false;
        }
    }

    if(eventEnd <= eventStart)
    {
        const msg = validationMessages.invalidStartEndTime+eventStart+' - '+eventEnd;
        if(isEdit)
        {
            if(isSearch)
            {
                document.getElementById(constants.searchResultTimeValidationResultId).innerHTML = msg;
            }
            else
            {
                document.getElementById(constants.eventDataTimeValidationResultId).innerHTML = msg;
            }   
        }
        else
        {
            document.getElementById(constants.timeValidationResultId).innerHTML = msg;
        }
        return false;
    }

    return true;
}

/**
 * Checks if the given event overlaps with other events that exist for the same day. 
 * @param {*} isEdit - Flag that denotes if the event is modified from the edit mode of the view event modal
 * @param {*} isSearch - Flag that denotes if the event is modified from the edit mode of the search event modal
 * @param {*} eventId - The id of the event that is modified
 */
function validateTime(isEdit, isSearch, eventId)
{
    let formData;
    let eventDate;
    let isAllDay;
    let eventStart;
    let eventEnd;
    let submittedTimeRange;
    let submittedStartHour;
    let submittedStartMinutes;
    let submittedEndHour;
    let submittedEndMinutes;

    isEdit === undefined ? isEdit=false : isEdit = isEdit;
    isSearch === undefined ? isSearch=false : isSearch = isSearch;

    if(isSearch || isEdit)
    {
        formData = document.getElementById(eventId);
        eventDate = eventId.substring(0, eventId.indexOf(constants.eventIdDieldDelimiter));
        eventStart = formData.childNodes[3].childNodes[0].value;
        eventEnd = formData.childNodes[4].childNodes[0].value; 
        isAllDay = formData.childNodes[5].childNodes[0];
    }
    else
    {
        formData = document.getElementById(constants.eventFormId);
        eventDate = formData.eventDate.value;
        isAllDay = formData.allDay;
        eventStart = document.getElementById(constants.eventStartId).value;
        eventEnd =  document.getElementById(constants.eventEndId).value;
        submittedStartHour = Number(eventStart.split(constants.timeStrDelimiter)[0]);
        submittedStartMinutes = Number(eventEnd.split(constants.timeStrDelimiter)[1]);
        submittedEndHour = Number(eventEnd.split(constants.timeStrDelimiter)[0]);
        submittedEndMinutes = Number(eventEnd.split(constants.timeStrDelimiter)[1]);
    }

    submittedStartHour = Number(eventStart.split(constants.timeStrDelimiter)[0]);
    submittedStartMinutes = Number(eventStart.split(constants.timeStrDelimiter)[1]);

    submittedEndHour = Number(eventEnd.split(constants.timeStrDelimiter)[0]);
    submittedEndMinutes = Number(eventEnd.split(constants.timeStrDelimiter)[1]);
    submittedTimeRange = new TimeRange(submittedStartHour, submittedStartMinutes, submittedEndHour, submittedEndMinutes);

    let submittedEventRange = submittedTimeRange.calculateHourRange();
    const existing = searchEventBy(eventDate, false);
    
    const overlapping = existing.filter((exstingEventId)=>{
        if(exstingEventId != eventId)
        {
            const existing = getEventById(exstingEventId);
            const existingStartHour = Number(existing.start.split(constants.timeStrDelimiter)[0]);
            const existingStartMinutes = Number(existing.start.split(constants.timeStrDelimiter)[1]);
            const existingEndHour = Number(existing.end.split(constants.timeStrDelimiter)[0]);
            const existingEndMinutes = Number(existing.end.split(constants.timeStrDelimiter)[1]);
            const existingTimeRange = new TimeRange(existingStartHour, existingStartMinutes, existingEndHour, existingEndMinutes);
            const existingEventRange = existingTimeRange.calculateHourRange();
            
            const overlap = existingEventRange.some((entry) => submittedEventRange.includes(entry) || (existing.allDay && isAllDay.checked));
            if(overlap)
            {
                if(existing.allDay)
                {
                    if(isAllDay.checked)
                    {
                        return existing;
                    }
                }
                else if(isAllDay.checked)
                {
                    return existing;
                }
                else
                {
                    document.getElementById(constants.eventDataTimeValidationResultId).innerHTML = '';
                    document.getElementById(constants.timeValidationResultId).innerHTML = '';
                    document.getElementById(constants.searchResultNameValidationResultId).innerHTML = '';
                }
                
                if(existingTimeRange.startHour < submittedTimeRange.startHour)
                {
                    if(existingTimeRange.endHour > submittedTimeRange.endHour)
                    {
                        return existing;
                    }
                    else if(existingTimeRange.endHour == submittedTimeRange.startHour)
                    {
                        if(existingTimeRange.endMinutes>=submittedTimeRange.startMinutes
                        || existingTimeRange.endMinutes>=submittedTimeRange.endMinutes
                        )
                        {
                            return existing;
                        }
                    }
                    else if(existingTimeRange.endHour == submittedTimeRange.endHour)
                    {
                        if(existingTimeRange.endMinutes>=submittedTimeRange.startMinutes
                        || existingTimeRange.endMinutes<=submittedTimeRange.endMinutes)
                        {
                            return existing;
                        }
                    }
                }
                else if(existingTimeRange.startHour==submittedTimeRange.startHour)
                {
                    if(existingTimeRange.startMinutes<=submittedTimeRange.startMinutes
                    || existingTimeRange.endMinutes>=submittedTimeRange.endMinutes)
                    {
                        return existing;
                    }
                }
                else if(existingTimeRange.startHour>submittedTimeRange.startHour)
                {
                    if(submittedTimeRange.endHour>existingTimeRange.startHour)
                    {
                        return existing;
                    }
                    else if (existingTimeRange.startHour==submittedTimeRange.endHour)
                    {
                        if(existingTimeRange.endMinutes<=submittedTimeRange.startMinutes)
                        {
                            return existing;
                        }
                    }        
                }
            }   
        }
    });

    if(overlapping === undefined || overlapping.length === 0)
    {
        if((!existing.allDay && !isAllDay.checked))
        {
            if(isEdit)
            {
                document.getElementById(constants.eventDataTimeValidationResultId).innerHTML = '';
                document.getElementById(constants.eventDataTimeValidationResultId).style.color = constants.errorMsgColor;
            }
            else if(isSearch)
            {
                document.getElementById(constants.searchResultTimeValidationResultId).innerHTML = '';
                document.getElementById(constants.searchResultTimeValidationResultId).style.color = constants.errorMsgColor;
            }
            else
            {
                document.getElementById(constants.timeValidationResultId).innerHTML = '';
                document.getElementById(constants.timeValidationResultId).style.color = constants.errorMsgColor;
            }
        }
    }
    else
    {
        const overlappingEvent = getEventById(overlapping[0]);
        let message;

        if(overlappingEvent.allDay)
        {
            message = icons.warningIcon + validationMessages.overlappingWithAllDayEvent + overlappingEvent.name;
        }
        else
        {
            message = icons.warningIcon + validationMessages.overlappingWithExistingEvent + overlappingEvent.name+'" ('+overlappingEvent.start+' - '+overlappingEvent.end+')';
        }

        let validationResult;
        if(isEdit &&!isSearch)
        {
            validationResult = document.getElementById(constants.eventDataTimeValidationResultId);
        }
        else if(isSearch)
        {
            validationResult = document.getElementById(constants.searchResultTimeValidationResultId);
        }
        else if(!isSearch)
        {
            validationResult = document.getElementById(constants.timeValidationResultId);
        }

        validationResult.style.color = constants.timeValidationMsgColor;
        validationResult.innerHTML = message;
    }
}

/**
 * Closes the event submission/event data modal.
 */
function closeModal()
{
    document.getElementById(constants.eventModalId).style.display = constants.displayNone;
    document.getElementById(constants.modalBackgroundId).style.display = constants.displayNone;
    document.getElementById(constants.eventDataContainerId).style.display = constants.displayNone;
    
    resetForm();
    resetList(constants.eventDataListId);

    document.getElementById(constants.nameValidationResultId).innerHTML = '';
    document.getElementById(constants.timeValidationResultId).innerHTML = '';
    document.getElementById(constants.eventDataTimeValidationResultId).innerHTML = '';
    document.getElementById(constants.eventDataNameValidationResultId).innerHTML = '';
    document.getElementById(constants.timeValidationResultId).style.color = constants.errorMsgColor;

    closeConfirmationModal();
    switchTab(constants.addNewEventMode);
}

/**
 * Closes the search event/overlapping event confirmation modals.
 */
function closeSearchModal()
{
    document.getElementById(constants.searchModalId).style.display = constants.displayNone;
    document.getElementById(constants.modalBackgroundId).style.display = constants.displayNone;
    document.getElementById(constants.searchResultNameValidationResultId).innerHTML = '';
    document.getElementById(constants.searchResultTimeValidationResultId).innerHTML = '';
    document.getElementById(constants.searchResultTimeValidationResultId).style.color = constants.errorMsgColor;
    resetList(constants.searchResultDataListId);
    document.getElementById(constants.resultListContainerId).style.display = constants.displayNone;
    closeConfirmationModal();
}

/**
 * Resets the data of the event submission form.
 */
function resetForm()
{
    let form = document.getElementById(constants.eventFormId);
    Array.from(form.elements).forEach((input) => {
        if(input.id === constants.eventIsAllDay)
        {
            input.checked = false;
        }
        else if(input.id === constants.eventStartId)
        {
            input.value = constants.eventStartDefault;
        }
        else if(input.id === constants.eventEndId)
        {
            input.value = constants.eventEndDefault;
        }
        else
        {
            input.value = "";
        }
    });
}

/**
 * Deletes the data of the list with the given id.
 * @param {*} id - The id of the list to be emptied.
 */
function resetList(id)
{
    let table = document.getElementById(id);
    if(table!=undefined)
    {
        let tBody = table.getElementsByTagName(constants.tbodyTag)[0];

        const childElementCount = tBody.childElementCount;
    
        for(let i=0;i<childElementCount;i++)
        {
            tBody.deleteRow(0);
        }
    }
}

/**
 * @param {*} event - An event object
 * @returns the eventId for a given event object.
 */
function getEventId(event)
{
    return event.date + constants.eventIdDieldDelimiter + event.start + constants.eventIdDieldDelimiter + event.name;
}

/**
 * Resets the event data & search result list contents.
 */
function resetEvent()
{
    resetList(constants.eventDataListId);
    document.getElementById(constants.eventDataNameValidationResultId).innerHTML = '';
    document.getElementById(constants.eventDataTimeValidationResultId).innerHTML = '';
    resetList(constants.searchResultDataListId);
    document.getElementById(constants.searchResultNameValidationResultId).innerHTML = '';
    document.getElementById(constants.searchResultTimeValidationResultId).innerHTML = '';

    searchEvent();
    switchTab(constants.viewEventsMode);
}

/**
 * Updates the given event's data after validating the new values.
 * @param {*} eventId - The id of the event to be updated
 * @param {*} isSearch - Flag that denotes if the event is modified via the search result list
 * @param {*} skipOverlapValidation - Flag that denotes if the overlapping time validation should be skipped (on overlapping event submission confirmation).
 */
function updateEvent(eventId, isSearch, skipOverlapValidation)
{
    if(skipOverlapValidation===undefined)
    {
        skipOverlapValidation = false;
    }

    const updatedEvent = getObjectFromList(eventId);
    const valid = validateForm(updatedEvent.name, updatedEvent.date, updatedEvent.start, updatedEvent.end, true, isSearch, eventId);
    
    if(valid)
    {
        if(!skipOverlapValidation)
        {
            let timeValidationResult;
            if(isSearch)
            {
                timeValidationResult = document.getElementById(constants.searchResultTimeValidationResultId);
            }
            else
            {
                timeValidationResult = document.getElementById(constants.eventDataTimeValidationResultId);
            }
            if((timeValidationResult.innerHTML===''))
            {
                deleteEvent(eventId);
                saveEvent(updatedEvent);
                resetList(constants.eventDataListId);
                switchTab(constants.viewEventsMode);
            }
            else
            {
                document.getElementById(constants.overlapConfirmationButtonId).setAttribute(constants.onclickEvent,"event.preventDefault();updateEvent('"+eventId+"', false, true)");
                document.getElementById(constants.overlapModalId).style.display=constants.displayFlex;
                document.getElementById(constants.overlapModalBackgroundId).style.display = constants.displayFlex;
            }
        }
        else
        {
            deleteEvent(eventId);
            saveEvent(updatedEvent);
            resetList(constants.eventDataListId);
            switchTab(constants.viewEventsMode);
        }
    }
}

/**
 * Retrieves the modified data of the given event from the event data list.
 * @param {*} eventId - The id of the event
 * @returns a CalendarEvent object containing the current values of the given event in the list.
 */
function getObjectFromList(eventId)
{
    let event = document.getElementById(eventId);
    let children = event.childNodes;

    let calendarEvent = new CalendarEvent();
    let thChildren = getEventTableColumns();

    for(let i=0; i<thChildren.length; i++)
    {
        const leafNodes = children[i].childNodes;
        
        for(let j=0;j<leafNodes.length;j++)
        {
            let field = thChildren[i].textContent;
            
            if(leafNodes[j].id.includes(constants.validationResultSpanIdSuffix))//Skip hidden span labels
            {
                continue;
            }

            if(field === constants.eventListNameField)
            {
                calendarEvent.name = leafNodes[j].value;
            }
            else if(field === constants.eventListDescriptionField)
            {
                calendarEvent.description = leafNodes[j].value;
            }
            else if(field === constants.eventListDateField)
            {
                calendarEvent.date = leafNodes[j].value;
            }
            else if(field === constants.eventListStartField)
            {
                calendarEvent.start = leafNodes[j].value;
            }
            else if(field === constants.eventListEndField)
            {
                calendarEvent.end = leafNodes[j].value;
            }
            else if(field === constants.eventListAllDayField)
            {
                const isChecked = leafNodes[j].checked;
                calendarEvent.allDay = isChecked ? true : false;
            }

        }
    }

    return calendarEvent;
}

/**
 * 
 * @returns A list containing the columns of the event data list
 */
function getEventTableColumns()
{
    let tableHead = document.getElementById(constants.eventDataListId).rows[0];
    let thChildren = tableHead.childNodes;
    thChildren = Array.from(thChildren).filter((child) => (child.textContent.indexOf("\n")==-1));

    return thChildren;
}

/**
 * Resets the fields of the table that were being modified if the user decides to modify
 * another event without saving/cancelling the modification of another row.
 * @param {*} isResultList - Flag that denotes if the event is modified from the search modal
 */
function resetPendingEvents(isResultList)
{
    let rows;
    if(isResultList)
    {
        rows = document.getElementById(constants.searchResultDataListId).childNodes[3];
    }
    else
    {
        rows = document.getElementById(constants.eventDataListId).childNodes[3];
    }

    rows.childNodes.forEach(tableRow => {
        let eventId = tableRow.id;
        tableRow.childNodes.forEach(td =>{
            let element = td.childNodes[0];
            if(element.nodeName === constants.inputNode)
            {
                if(element.type===constants.inputTypeCheckbox)
                {
                    element.disabled = true;
                }
                else
                {
                    const content = element.value;
                    td.removeChild(element);
            
                    let span = document.createElement(constants.spanTag);
                    span.textContent = content;
                    td.appendChild(span);
                }
            }
            else if(element.nodeName === constants.aNode)
            {
                const content = element.textContent
                    
                if(content === icons.confirmIcon)
                {
                    let btn = document.createElement(constants.aNode);
                    btn.href = constants.preventDefault;
                    btn.setAttribute(constants.onclickEvent,"event.preventDefault();editEvent('"+eventId+"',"+isResultList+")");
                    btn.className = cssClasses.glyphIcon;
                    btn.textContent = icons.editIcon;
                    
                    td.removeChild(element);
                    td.appendChild(btn);
                }
                else if(content === icons.cancelIcon)
                {
                    let btn = document.createElement(constants.aNode);
                    btn.href = constants.preventDefault;
                    btn.setAttribute(constants.onclickEvent,"event.preventDefault();deleteEvent('"+eventId+"');");
                    btn.className = cssClasses.glyphIcon;
                    btn.textContent = icons.deleteIcon;
                    
                    td.removeChild(element);
                    td.appendChild(btn);
                }
            }
        });
    });
}

/**
 * Converts the fields of the event to the corresponding input fields
 * @param {*} eventId - The id of the event to be modified
 * @param {*} isSearchResult - Flag that denotes if the event is modified from the search modal
 */
function editEvent(eventId, isSearchResult)
{
    if(isSearchResult === undefined)
    {
        isSearchResult = false;
    }
    let row = document.getElementById(eventId);
    let children = row.childNodes;

    resetPendingEvents(isSearchResult);

    let thChildren = getEventTableColumns();

    for(let i=0;i<children.length;i++)
    {
        let currentNode = children[i];
        let last = children[i].lastChild;
        const content = last.textContent;

        currentNode.removeChild(last);
        
        if(last.nodeName === constants.spanNode)
        {
            let input1 = document.createElement(constants.inputElement);
            const field = thChildren[i].textContent;

            if(field === constants.eventListDateField)
            {
                input1.setAttribute(constants.inputTypeAttribute,constants.eventListDateField);
            }
            else if(field === constants.eventListStartField)
            {
                input1.setAttribute(constants.inputTypeAttribute, constants.inputTypeTime);
                input1.setAttribute(constants.onchangeEvent, 'validateTime(true, '+isSearchResult+', "'+eventId+'")');
                input1.id = eventId + constants.editStartTimeInputIdSuffix;
            }
            else if(field === constants.eventListEndField)
            {
                input1.setAttribute(constants.inputTypeAttribute, constants.inputTypeTime);
                input1.setAttribute(constants.onchangeEvent, 'validateTime(true, '+isSearchResult+', "'+eventId+'")');
                input1.id = eventId + constants.editEndTimeInputIdSuffix;
            }

            input1.value = content;
            if(document.getElementById(thChildren[i].textContent+constants.editValidationResultId) === undefined)
            {
                let info = document.createElement(constants.spanTag);
                info.id = thChildren[i].textContent+constants.editValidationResultId;
                info.className = cssClasses.validationResult;
                currentNode.appendChild(info);
            }

            currentNode.appendChild(input1);
            
        }
        else if(last.nodeName===constants.aNode)
        {
            let btn = document.createElement(constants.aNode);
            if(content === icons.editIcon)
            {
                btn.href = constants.preventDefault;
                btn.setAttribute(constants.onclickEvent,"event.preventDefault();updateEvent('"+eventId+"',"+isSearchResult+")");
                btn.className = cssClasses.glyphIcon;
                btn.textContent = icons.confirmIcon;
            }
            else if(content === icons.deleteIcon)
            {
                btn.href = constants.preventDefault;
                btn.setAttribute(constants.onclickEvent,"resetEvent()");
                btn.className = cssClasses.glyphIcon;
                btn.textContent = icons.cancelIcon;
            }

            currentNode.appendChild(btn);
        }
        else if(last.nodeName === constants.inputNode)
        {
            if(last.type===constants.inputTypeCheckbox)
            {
                let checkbox = document.createElement(constants.inputElement);
                checkbox.setAttribute(constants.inputTypeAttribute,constants.inputTypeCheckbox);
                checkbox.checked = last.checked;
                checkbox.setAttribute(constants.onchangeEvent, "validateTime(true, "+isSearchResult+", '"+eventId+"')");
                currentNode.appendChild(checkbox);
            }
        }
    }
}

/**
 * Removes an event from the browser's local storage.
 * @param {*} eventId - The id of the event to be removed
 */
function deleteEvent(eventId)
{
    deleteEventFromStorage(eventId);
    document.location.reload();
}

/**
 * Appends the edit/delete options to the given event of a list.
 * @param {*} event - The name of the event
 * @param {*} row - The row of the table to be modified
 * @param {*} isSearchResult - Flag that denotes if the given row is a result of the search table
 */
function addOptions(event, row, isSearchResult)
{
    if(isSearchResult === undefined)
    {
        isSearchResult = false;
    }

    const eventId = getEventId(event);
    let editTd = document.createElement(constants.tdTag);
    let editBtn = document.createElement(constants.aTag);
    
    editBtn.textContent = icons.editIcon;
    editBtn.href = constants.preventDefault;
    editBtn.className = cssClasses.glyphIcon;
    editBtn.setAttribute(constants.onclickEvent,"editEvent('"+eventId+"',"+isSearchResult+");");
    editTd.id = constants.editEventIdPrefix + eventId;
    editTd.append(editBtn);

    let deleteTd = document.createElement(constants.tdTag);
    let deleteBtn = document.createElement(constants.aTag);
    deleteBtn.textContent = icons.deleteIcon;
    deleteBtn.href = constants.preventDefault;
    deleteBtn.className = cssClasses.glyphIcon;
    deleteBtn.setAttribute(constants.onclickEvent,"event.preventDefault();deleteEvent('"+eventId+"');");
    deleteTd.id = constants.deleteEventIdPrefix+eventId;
    deleteTd.append(deleteBtn);

    row.append(editTd);
    row.append(deleteTd);
}

/**
 * Toggles between add new event & event list functionalities of the event modal
 * @param {*} mode: The mode to be used (add/view)
 * @returns 
 */
function switchTab(mode)
{

    let eventForm =  document.getElementById(constants.eventFormId);    
    let eventList = document.getElementById(constants.eventListId);

    if(mode === constants.addNewEventMode)
    {
        document.getElementById(constants.eventListId).style.display = constants.displayNone;
        eventForm.style.display=constants.displayFlex;
        
        resetList(constants.eventDataListId);
    }
    else
    {
        let numOfRows = document.getElementById(constants.eventDataListId).getElementsByTagName(constants.tbodyTag)[0].childElementCount;

        if(mode===constants.viewEventsMode && eventList.style.display===constants.displayFlex)//Prevent additional elements
        {
            if(numOfRows>0)
            {
                return;
            }
        }

        eventForm.style.display=constants.displayNone;
        let events = getAllEventsForDay(eventForm.eventDate.value);
        
        if(events.length>0)
        {
            for(let i=0;i<events.length;i++)
            {
                document.getElementById(constants.eventDataListId).className = cssClasses.currentEvents;
                document.getElementById(constants.eventDataContainerId).className = cssClasses.currentEvents;

                const evt = JSON.parse(events[i]);
                let eventId = getEventId(evt);
                let found;
                let rows = document.getElementsByTagName(constants.tableTag)[0].rows;

                for(let j=1;j<rows.length;j++)
                {
                    if(rows[j].id===evt.id)
                    {
                        found = true;
                    }
                }

                if(!found)
                {
                    let row = document.createElement(constants.trTag);
                    row.id = eventId;
                    addElementToTable(evt, row,constants.eventDataListId);
                }
            }
        }
        else
        {
            document.getElementById(constants.eventDataListId).className = cssClasses.eventDataListEmpty;
            document.getElementById(constants.eventDataContainerId).className = cssClasses.eventDataListEmpty;
        }
        
        document.getElementById(constants.eventListId).style.display = constants.displayFlex;
        document.getElementById(constants.eventDataContainerId).style.display = constants.displayFlex;
    }
}