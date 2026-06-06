
let events = {}
let config = {}



function csvToArray(text) {
    // cribbed from stack overflow...
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
};

async function downloadData() {
    // This cache breaker works for now but is not ideal. Being able to cache for a few minutes would be ideal.
    const cacheBreaker = Math.random()
    let response = await fetch("./events.csv?q=" + cacheBreaker);
    if (!response.ok) {
        console.log("Could not get events.csv do you need to rename the events_example.csv?");
        console.log("While this will work you'll have issues when you want to update");
        response = await fetch("./events_example.csv?q=" + cacheBreaker);
    }
    const data = await response.text();

    const toProcess = csvToArray(data);

    for (let i = 1; i < toProcess.length; i++) {
        const row = toProcess[i];
        if (row.length == 1 && row[0] == "") {
            continue;
        }
        console.log(row);
        // "Name", "Start date", "Start time", "End date", "End Time", "Description", "URL", "Latitude", "Longitude"
        const event = {
            "name": row[0].trim(),
            "startDate": row[1].trim(),
            "startTime": row[2].trim(),
            "endDate": row[3].trim(),
            "endTime": row[4].trim(),
            "description": row[5].trim(),
            "url": row[6].trim(),
            "latitude": row[7].trim(),
            "longitude": row[8].trim(),
        };

        // Add an entry for each day
        let currentDate = new Date(event.startDate);
        let endDate = new Date(event.endDate);
        while (currentDate <= endDate) {
            const dateValue = format_date(currentDate);
            if (!(dateValue in events)) {
                events[dateValue] = []
            }
            events[dateValue].push(event);

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
}

async function loadConfig() {
    const response = await fetch("./config.json");
    const data = await response.json();

    config = data;
}


function applyConfig() {
    document.getElementById("heading").innerText = config.name;
    document.getElementById("description").innerText = config.description;
    document.title = config.name;

    const linkEl = document.getElementById("update_link");
    if (config.showUpdateLink && config.showUpdateLink == "true") {
        linkEl.href = config.repo;
    } else {
        linkEl.href = "";
        linkEl.style.display = "none";
    }
    if (!config.showIcsLink || config.showIcsLink != "true") {
      const icsLinkEl = document.getElementById("ics_link_div")
      icsLinkEl.style.display = "none";
    }
}

function format_date(date) {
    return "" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
}

function to_month_name(month) {
    const names = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    return names[month - 1];
}

async function init() {

    // get year and month from url parameters, or default to current month and year if they don't exist
    const params = new URLSearchParams(document.location.search);
    const now = new Date();
    let year = params.get("year");
    if (year == null) {
        year = now.getFullYear();
    } else {
        year = Number(year);
    }

    let month = Number(params.get("month"));
    if (month == null || (month < 1 || month > 12)) {
        month = now.getMonth() + 1;
    }
    setupHeader(year, month);

    if (Object.getOwnPropertyNames(config).length == 0) {
        loadConfig().then(applyConfig);
    } else {
        applyConfig();
    }

    if (Object.getOwnPropertyNames(events).length == 0) {
        await downloadData();
    }
    clearMonthGrid();

    createMonthGrid(year, month, function (el, date) {
        const dateStr = format_date(date);
        if (dateStr in events) {
            for (let i = 0; i < events[dateStr].length; i++) {
                const event = events[dateStr][i];
                let eventEl = document.createElement("div");
                eventEl.classList.add("event");
                eventEl.innerText = event.name;

                let eventPopupEl = document.createElement("div");
                eventPopupEl.classList.add("popup");
                let popupHtml = "<div class=\"popupTitle\">";
                if (event.url) {
                    popupHtml = popupHtml + `<a href="${event.url}" target="_blank">${event.name}</a>`;
                } else {
                    popupHtml = popupHtml + event.name;
                }
                popupHtml = popupHtml + `</div>
                    <div>${event.description}</div>
                    <div>Starts: ${event.startDate} - ${event.startTime}</div>
                    <div>Finish: ${event.endDate} - ${event.endTime}</div>`;

                if (event.latitude && event.longitude) {
                    popupHtml = popupHtml + `
                        <div>Location: <a href="https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=17/${event.latitude}/${event.longitude}" target="_blank">${event.latitude}:${event.longitude}</a></div>
                    `;
                }

                eventPopupEl.innerHTML = popupHtml;

                eventEl.appendChild(eventPopupEl);

                el.appendChild(eventEl);
            }
        }
    })

}


const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

function daysFromPreviousMonth(firstOfMonth) {
    // first of month is a sunday
    if (firstOfMonth.getDay() == 0) {
        return 6;
    } else {
        return firstOfMonth.getDay() - 1;
    }
}

function clearMonthGrid() {
    const parentEl = document.getElementById("calGrid");
    while (parentEl.firstChild) {
        parentEl.removeChild(parentEl.lastChild);
    }
}

function createDateElement(parentEl, year, month, i, currentMonth, callback) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calDay");
    if (!currentMonth) {
        dayDiv.classList.add("prevMonth");
    }
    const numberDiv = document.createElement("div");
    numberDiv.classList.add("dayLabel");
    numberDiv.innerText = "" + i;

    dayDiv.appendChild(numberDiv);

    callback(dayDiv, new Date(year, month - 1, i));

    parentEl.appendChild(dayDiv);
}

function createMonthGrid(year, month, callback) {
    const parentEl = document.getElementById("calGrid");

    const firstOfMonth = new Date(year, month - 1, 1);
    const daysInThisMonth = daysInMonth(year, month);
    const lastOfMonth = new Date(year, month - 1, daysInThisMonth);

    const lastDaysToShow = daysFromPreviousMonth(firstOfMonth);
    const daysInLastMonth = daysInMonth(year, month - 1);

    // Days from previous month to pad the week
    for (let i = daysInLastMonth - lastDaysToShow + 1; i <= daysInLastMonth; i++) {
        createDateElement(parentEl, year, month - 1, i, false, callback)
    }

    // Days from current month
    for (let i = 1; i <= daysInThisMonth; i++) {
        createDateElement(parentEl, year, month, i, true, callback)
    }

    // Days in next month to pad the grid
    if (lastOfMonth.getDay() > 0) {
        for (let i = 1; i <= 7 - lastOfMonth.getDay(); i++) {
            createDateElement(parentEl, year, month + 1, i, false, callback)
        }
    }

}

function buildUrl(year, month) {
    let existingParams = new URLSearchParams(document.location.search);
    existingParams.set("year", year);
    existingParams.set("month", month);
    const result = document.location.protocol + "//" + document.location.host
        + document.location.pathname + "?" + existingParams.toString();

    return result;
}

function setupHeader(year, month) {
    const headerTitleEl = document.getElementById("calDateHeader");
    headerTitleEl.innerText = "" + to_month_name(month) + " " + year;

    const prevMonthEl = document.getElementById("prevMonthLink");
    prevMonthEl.onclick = function (ev) {
        let newYear = year;
        let newMonth = month - 1;
        if (month == 1) {
            newYear -= 1;
            newMonth = 12;
        }
        const newUrl = buildUrl(newYear, newMonth);
        window.history.replaceState({ path: newUrl }, "", newUrl);

        init();
    };

    const nextMonthEl = document.getElementById("nextMonthLink");
    nextMonthEl.onclick = function (ev) {
        let newYear = year;
        let newMonth = month + 1;
        if (month == 12) {
            newYear += 1;
            newMonth = 1;
        }
        const newUrl = buildUrl(newYear, newMonth);
        if (newUrl != document.location.toString()) {
            window.history.replaceState({ path: newUrl }, "", newUrl);
        }

        init();
    };

}