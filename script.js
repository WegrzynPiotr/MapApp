
const containerMapTitle = document.querySelector(".container__map p")
const containerMap = document.querySelector(".container__map")
const containerWorkout = document.querySelector(".container__workout");
const containerInfo = document.querySelector(".container__info");
const compass = document.querySelector(".container__compass")
const initZoom = 12;
const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
let duration, speed, height, map, polyline, markersId = -1, container, distanceFromToMarkers, distanceCoords = [], copyMarkers = [], markerOnMap, currentWorkout, allMarkers = []

const toggleContainers = () => {
    if (document.querySelector(".container__workout").children.length == 0) {
        containerInfo.classList.add("hidden")
        containerMap.classList.add("hidden")
    } else {
        containerInfo.classList.remove("hidden")
        containerMap.classList.remove("hidden")
    }
}

toggleContainers()

const speedCalcutate = (duration, distance) => {
    if (speed.value) {
        return speed.value
    } else {
        return +(((distance / duration) * 60).toPrecision(2))

    }
}

const timeCalculate = (distance, speed) => {
    if (duration.value) {
        return duration.value
    } else {
        return +(((distance / speed) * 60).toPrecision(2))

    }
}

const renderMap = (posX, posY) => {
    map = L.map('map').setView([posX, posY], initZoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const removeWorkout = function (e) {
        const removeBtnId = this.id
        allMarkers[removeBtnId].forEach(el => el.remove())
        console.log(removeBtnId)
        toggleContainers()
        map.flyTo(allMarkers[removeBtnId][1].getLatLng(), initZoom, {
            duration: .3,
        });
        e.stopPropagation()
    }

    const zoomToMarker = function () {
        const containerId = this.id
        toggleContainers()
        map.flyTo(allMarkers[containerId][1].getLatLng(), 14, {
            duration: 1,
        });
        if (window.innerWidth <= 1000) {
            let observerWorkoutOptions = {
                root: containerWorkout,
                threshold: 1,
            }

            let observerWorkout = new IntersectionObserver((elements) => {
                elements.forEach(element => {
                    if (!element.isIntersecting) {
                        allMarkers[containerId][0].scrollIntoView({ behavior: "smooth" })
                    }
                })
                observerWorkout.unobserve(allMarkers[containerId][0]);
            }, observerWorkoutOptions);
            observerWorkout.observe(allMarkers[containerId][0]);
        }


    }


    const addWorkout = (e) => {
        e.preventDefault()
        if (duration.value <= 0 && speed.value <= 0) return
        let form = document.querySelector(".form");
        currentWorkout = document.querySelector("#workout").value;
        getDistance()
        copyMarkers.forEach((marker, index) => {
            marker._popup._content = currentWorkout;
            marker._icon.setAttribute("data-training", currentWorkout)
        })
        form.remove();
        markersId++
        let date = new Date();
        let dayOfMonth = date.getDate()
        let monthIndex = [date.getMonth()]
        container = document.createElement("div");
        container.id = markersId
        container.className = `workout__box ${setStyle(currentWorkout)}`

        const workoutContainer = `
        <h3 class="workout__title">${currentWorkout} on ${months[monthIndex]} ${dayOfMonth}</h3>
        <p class="workout__info">
        <span class="workout__distance">${distanceFromToMarkers}km</span>
        <span class="workout__duration"> ${timeCalculate(distanceFromToMarkers, speed.value)}min</span>
        <span class="workout__speed"> ${speedCalcutate(duration.value, distanceFromToMarkers)}km/h</span>
        ${height.value > 0 ? `<span class="workout__height">${height.value}m</span>` : ""}
        </p>
        `

        containerWorkout.append(container)
        let removeWorkoutBtn = document.createElement("span")
        removeWorkoutBtn.className = "remove__workout"
        removeWorkoutBtn.setAttribute("id", markersId)
        container.innerHTML += workoutContainer
        container.insertAdjacentElement("afterbegin", removeWorkoutBtn)

        let editWorkoutBtn = document.createElement("span")
        editWorkoutBtn.className = "edit__workout"
        editWorkoutBtn.setAttribute("id", markersId)
        editWorkoutBtn.textContent = "Edit"
        container.insertAdjacentElement("afterbegin", editWorkoutBtn)
        allMarkers.push([container, copyMarkers[0], copyMarkers[1], polyline])
        removeWorkoutBtn.addEventListener("click", removeWorkout)
        editWorkoutBtn.addEventListener("click", editForm)
        container.addEventListener("click", zoomToMarker)
    }

    const onMapClick = (e) => {
        const { lat, lng } = e.latlng;
        const form = document.querySelector('.form');
        if (!form) {
            markerOnMap = L.marker([lat, lng]).addTo(map)
                .closePopup()
                .bindPopup(`workout`)
            markerOnMap.dragging.enable()
            distanceCoords.push(markerOnMap)
        }

        if (distanceCoords.length == 2) {
            copyMarkers = [...distanceCoords]
            createForm()
            toggleContainers()

            distanceCoords.length = 0
        }
    }

    const getDistance = () => {
        copyMarkers[0].dragging.disable()
        copyMarkers[1].dragging.disable()
        distanceFromToMarkers = (copyMarkers[0].getLatLng().distanceTo(copyMarkers[1].getLatLng()) / 1000).toFixed(2)
    }

    const setStyle = (currentWorkout) => {
        let colors;
        let nameofClass;
        if (currentWorkout == "running") {
            colors = "red"
            nameofClass = "running"
        } else {
            colors = "rgb(15, 124, 136)";
            nameofClass = "bike"
        }
        polyline = L.polyline([copyMarkers[0].getLatLng(), copyMarkers[1].getLatLng()], { color: colors }).addTo(map);
        return nameofClass
    }

    map.on('click', onMapClick);

    function editForm(e) {
        const editBtn = this.id
        // toggleContainers()
        allMarkers[editBtn][3].remove()
        e.target.parentElement.remove()

        markersId = this.id
        createForm()
        console.log(markersId, this.id)
        // allMarkers[editBtn][3].remove()
        allMarkers[editBtn][1].dragging.enable()
        allMarkers[editBtn][2].dragging.enable()
        e.stopPropagation()
    }


    const createForm = () => {
        const form = document.createElement("form");
        form.className = "form"
        form.innerHTML = `<label>Type<select name="workout" id="workout">
        <option value="running">Running</option>
        <option value="bike">Bike</option>
        </select></label>
        <label>Time duration <input type="number" id="duration" placeholder="min"></label>
        <label>Average speed <input type="number" id="speed" placeholder="km/h"></label>
        <label>Average Height <input type="number" id="height" placeholder="m"></label>
        <button type="submit">Save Workout</button>
        `

        containerWorkout.appendChild(form);
        // if (window.innerWidth <= 1000) {

        let observerOptions = {
            root: containerWorkout,
            threshold: 1,
        }

        let observer = new IntersectionObserver((elements) => {
            elements.forEach(element => {
                if (!element.isIntersecting) {
                    form.scrollIntoView({ behavior: "smooth" })
                }
            })
            observer.unobserve(form);
        }, observerOptions);

        observer.observe(form);


        // }
        // document.querySelector(".container__author").scrollIntoView({ behavior: "smooth" })
        // console.log(form.children)

        // distanceCoords.forEach(marker => console.log(currentWorkout))

        duration = document.querySelector("#duration")
        speed = document.querySelector("#speed")
        height = document.querySelector("#height")
        duration.focus()
        form.addEventListener('submit', addWorkout)

        // if (duration.value || speed.value) {
        // }
        return form
    }
}


const getCurrentLoc = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
        if (navigator.geolocation) {
            let positionX = position.coords.latitude
            let positionY = position.coords.longitude
            renderMap(positionX, positionY)
            compass.addEventListener("click", setMapPosition.bind(null, positionX, positionY, initZoom))

        }
        else console.log(new Error("Navigator not found!"))
    }, () => containerMapTitle.textContent = "Location not found!")
}

const setMapPosition = (posX, posY, zoom) => {
    map.setView([posX, posY], zoom)
}

getCurrentLoc()
