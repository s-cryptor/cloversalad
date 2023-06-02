import './style.scss';
import 'bulma';
import _ from 'lodash';


import { createList } from './module';

import { fishes } from './data/fish//allfish.js';


function updateQueryParam(key, value) {
    var url = new URL(window.location.href);
    url.searchParams.set(key, value);

    var newUrl = url.href;
    window.history.replaceState({ path: newUrl }, '', newUrl);
}


function findMatchingId(originalId, tolerance) {
    const originalFish = _.find(fishes, { id: originalId });

    if (!originalFish) {
        return []; // Aucune correspondance trouvée
    }

    const originalPositions = originalFish.positions;

    const matchingFish = _.filter(fishes, (f) => {
        if (f.id === originalId) {
            return false; // Ignorer l'ID d'origine
        }

        const isMatchingPosition = _.some(f.positions, (pos) => {
            return _.some(originalPositions, (originalPos, index) => {
                const isMatching = (
                    pos.x > (originalPos.x - tolerance) &&
                    pos.x < (originalPos.x + tolerance) &&
                    pos.y > (originalPos.y - tolerance) &&
                    pos.y < (originalPos.y + tolerance)
                );

                if (isMatching) {
                    f.originalPosition = index; // Ajouter originalPosition à l'objet correspondant
                }

                return isMatching;
            });
        });

        return isMatchingPosition && f.map === originalFish.map;
    });

    return _.map(matchingFish, (fish) => {
        const matchingPositions = _.filter(fish.positions, (pos) => {
            return (
                pos.x > (originalPositions[0].x - tolerance) &&
                pos.x < (originalPositions[0].x + tolerance) &&
                pos.y > (originalPositions[0].y - tolerance) &&
                pos.y < (originalPositions[0].y + tolerance)
            );
        });

        const neighborPositions = _.map(matchingPositions, (pos) => {
            return {
                x: pos.x,
                y: pos.y
            };
        });

        return {
            id: fish.id,
            neighborPositions: neighborPositions,
            name: fish.name,
            originalPosition: fish.originalPosition // Ajouter originalPosition au résultat
        };
    });
}



document.addEventListener('DOMContentLoaded', () => {

    let currentId = "01";
    let currentFish = _.find(fishes, { id: currentId });
    let currentMinPoints = (currentFish.type == "common" ? 300 : currentFish.type == "rare" ? 400 : currentFish.type == "epic" ? 500 : 5000)
    let unit = "kgs";
    document.querySelector(".weight-toggle-container input").addEventListener("change", (e) => {
        unit = e.target.checked ? "kgs" : "lbs";
        loadFish(currentId);
    })

    // Functions to open and close a modal
    function openModal($el) {
        $el.classList.add('is-active');
    }

    function closeModal($el) {
        $el.classList.remove('is-active');
    }

    function closeAllModals() {
        (document.querySelectorAll('.modal') || []).forEach(($modal) => {
            closeModal($modal);
        });
    }

    // Add a click event on buttons to open a specific modal
    (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
        const modal = $trigger.dataset.target;
        const $target = document.getElementById(modal);
        $trigger.addEventListener('click', () => {
            openModal($target);
        });
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
        const $target = $close.closest('.modal');

        $close.addEventListener('click', () => {
            closeModal($target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        const e = event || window.event;

        if (e.keyCode === 27) { // Escape key
            closeAllModals();
        }
    });

    fishes.forEach(fish => {
        createList(fish)
    })

    function toggleSideMenu() {
        document.querySelector(".csidebar").classList.toggle("visible");
        document.querySelector(".menu-toggle").classList.toggle("toggle-is-visible");
    }
    document.querySelector(".menu-toggle").addEventListener("click", () => {
        toggleSideMenu();
    })

    /**SWIPE */
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;
    var yDown = null;

    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                // Swipe to the left
                if (!isTargetElementRange(evt.target)) {
                    triggerSwipeLeftEvent();
                }
            } else {
                // Swipe to the right
                if (!isTargetElementRange(evt.target)) {
                    triggerSwipeRightEvent();
                }
            }
        }

        // Reset values
        xDown = null;
        yDown = null;
    };

    function isTargetElementRange(targetElement) {
        return targetElement.id === 'range';
    }

    function triggerSwipeLeftEvent() {
        document.querySelector(".csidebar").classList.remove("visible")
    }

    function triggerSwipeRightEvent() {
        document.querySelector(".csidebar").classList.add("visible")
    }





    /*
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    var xDown = null;
    var yDown = null;

    function getTouches(evt) {
        return evt.touches ||             // browser API
            evt.originalEvent.touches; // jQuery
    }

    function handleTouchStart(evt) {
        const firstTouch = getTouches(evt)[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    };

    function handleTouchMove(evt) {
        if (!xDown || !yDown) {
            return;
        }

        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                toggleSideMenu()
            } else {
                toggleSideMenu()
            }
        }
        xDown = null;
        yDown = null;
    };
    */

    function loadFish(id) {

        // TODO NEIGHBOR
        console.log(findMatchingId(id, 10));



        const fish = _.find(fishes, { id: id });
        currentFish = fish;

        currentMinPoints = (currentFish.type == "common" ? 300 : currentFish.type == "rare" ? 400 : currentFish.type == "epic" ? 500 : 5000)

        updateRange();
        Array.from(document.querySelectorAll(".unit")).forEach(elem => {
            elem.innerHTML = unit;
        })
        document.getElementById("range").value = 50;

        document.querySelector(".cdata-container").setAttribute("data-map", fish.map);

        const isIn = fish.seasons[new Date().getMonth()] ? "in" : "out";

        document.querySelector("#season-message").setAttribute("class", isIn);


        document.querySelector(".season-max-weight .mm-value").innerHTML = (currentFish[unit].min + ((currentFish[unit].max - currentFish[unit].min) * 0.2)).toFixed(2);

        document.querySelector(".season-max-points .mm-value").innerHTML = currentMinPoints + currentMinPoints * 0.2;
        

        document.querySelector("#no-shadow").setAttribute("data-noshadow", currentFish.attributes[0].shadow[0] === false ? true : false);

        currentFish.attributes.forEach(attribute => {
            const attributeName = Object.keys(attribute)[0];
            const elem = document.querySelector(`[data-fishattribute='${attributeName}']`) || false;
            if (elem) {
                Array.from(elem.querySelectorAll(".svg-container")).forEach((svg, index) => {
                    svg.setAttribute("data-current-svg", attribute[attributeName].includes(index) || false)
                })
            }
        })

        document.getElementById("fishName").innerHTML = fish.name.eng;
        document.getElementById("fishType").innerHTML = fish.type;
        document.getElementById("map").setAttribute("src", `./images/map-${fish.map}.jpg`);
        document.getElementById("mapName").innerHTML = fish.map;
        document.getElementById("mapName").setAttribute("class", `map-${fish.map}`)
        document.getElementById("positionNote").innerHTML = fish.positionNote
        document.getElementById("positions-container").innerHTML = "";
        for (let i = 0; i < fish.positions.length; i++) {
            const position = document.createElement("div");
            position.setAttribute("class", "ccross");
            position.setAttribute("data-fishid", id)
            position.setAttribute("style", `background-image:url("./images/${id}.png");top:${fish.positions[i].x}%;left:${fish.positions[i].y}%`)
            document.getElementById("positions-container").appendChild(position)
        }

        fish.seasons.forEach((month, index) => {
            month ? document.querySelectorAll(".months-container > div")[index].setAttribute("class", "season") : document.querySelectorAll(".months-container > div")[index].removeAttribute("class");
        });

        document.querySelector("#minmax-min-points").innerHTML = currentMinPoints;
        document.querySelector("#minmax-max-points").innerHTML = currentMinPoints * 2;

        document.querySelector(".cdata-container").setAttribute("data-season", currentFish.seasons[new Date().getMonth()])

        document.getElementById("fish-image").setAttribute("src", `./images/${fish.id}.png`);

        Array.from(document.querySelectorAll("#minweight, #minmax-min-weight")).forEach(element => {
            element.innerHTML = fish[unit].min;
        });

        Array.from(document.querySelectorAll("#maxweight, #minmax-max-weight")).forEach(element => {
            element.innerHTML = fish[unit].max;
        })


        Array.from(document.querySelectorAll(".step-weight")).forEach((step, index) => {
            const fifth = (fish[unit].max - fish[unit].min) * 0.2;
            step.innerHTML = (fish[unit].min + fifth * (index * 1)).toFixed(2);
        })

        Array.from(document.querySelectorAll(".step-points")).forEach((step, index) => {
            const fifth = currentMinPoints / 5;
            step.innerHTML = currentMinPoints + (fifth * (index));
        })

        // If monster
        if (currentFish.type == "monster") {

            function getDateOfDay(offset) {
                var currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + offset);
                return currentDate;
            }

            function formatDate(date) {
                var month = ('0' + (date.getMonth() + 1)).slice(-2);
                var day = ('0' + date.getDate()).slice(-2);

                return month + '/' + day;
            }


            function getDateConstraint(date, length) {
                var baseDate = new Date('2023-06-01');
                var diffInDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
                var cycleLength = length;
                var result = (diffInDays % cycleLength + cycleLength) % cycleLength;
                return result;
            }

            Array.from(document.querySelectorAll("#positions-container > div")).forEach((spot, index, array) => {

                const len = array.length;
                const start = index - 1;

                spot.setAttribute("data-spot-day", formatDate(getDateOfDay(start)));

                var inputDate = getDateOfDay(start)
                var constraint = getDateConstraint(inputDate, len);



                console.log("date=", formatDate(getDateOfDay(start)), "spot index=", index, " ", constraint);

                spot.setAttribute("data-today-spot", "false")    


                if(start == 0){
                    spot.setAttribute("data-today-spot", "true")    
                }


            })
        }




    }



    loadFish(currentId)

    Array.from(document.querySelectorAll(".item")).forEach(item => {
        item.addEventListener("click", () => {
            const id = item.getAttribute("data-id");
            currentId = id;
            loadFish(currentId)
        })
    })

    document.querySelectorAll(".months-container > div")[new Date().getMonth()].setAttribute("data-current", "true");


    function updateRange(percent = 10) {
        document.getElementById("range-values-container").style.left = percent + "%";
        document.getElementById("percent").innerHTML = Number(percent).toFixed(2);

        Array.from(document.querySelectorAll(".stars-container .svg-container")).forEach((container, index) => {
            container.setAttribute("data-current-svg", percent > (index) * 20)
        })


        document.querySelector("#weight").value = ((currentFish[unit].max - currentFish[unit].min) * (Number(percent) / 100) + currentFish[unit].min).toFixed(3);


        document.querySelector("#points").value = (currentMinPoints + currentMinPoints * (percent / 100)).toFixed();
        document.querySelector("#range-color").style.width = percent + "%"
        document.getElementById("range").value = percent;
    }

    document.querySelector("#range").addEventListener("input", (e) => {
        updateRange(e.target.value)
    })


    Array.from(document.querySelectorAll(".range-input")).forEach(input => {
        input.addEventListener("keyup", () => {

            if (input.getAttribute("id") == "points") {
                if (input.value >= currentMinPoints && input.value <= (currentMinPoints * 2)) {
                    const currentPercent = ((input.value - currentMinPoints) / currentMinPoints) * 100;
                    updateRange(currentPercent)
                }
            }

            if (input.getAttribute("id") == "weight") {
                if (input.value >= currentFish[unit].min && input.value <= currentFish[unit].max) {
                    if (/^\d+(\.\d{3})$/.test(input.value)) {
                        const currentPercent = ((input.value - currentFish[unit].min) / (currentFish[unit].max - currentFish[unit].min)) * 100;

                        updateRange(currentPercent)
                    }
                }
            }
        })
    })


    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("list-title")) {
            e.target.closest(".list-container").classList.toggle("hidden-list");
        }
    })


    const items = Array.from(document.querySelectorAll(".item"));


    function checkScreenWidth() {
        var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var isLessThan768 = screenWidth < 768;
        if (isLessThan768) {
            document.querySelector(".csidebar").classList.remove("visible");

            items.forEach(item => {
                item.addEventListener("click", () => {
                    document.querySelector(".csidebar").classList.remove("visible");
                })
            })
        }
    }

    window.addEventListener('load', function () {
        checkScreenWidth();
    });

    window.addEventListener('resize', function () {
        checkScreenWidth();
    });





});


function onPageLoad(callback) {
    if (document.readyState === 'complete' || (document.readyState !== 'loading' && !document.documentElement.doScroll)) {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}
onPageLoad(function () {
    setTimeout(() => {
        document.body.classList.remove("is-loading");

    }, 500)
});