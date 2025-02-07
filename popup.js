var setupList = []
var firstSetup = true

document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get({
        options: [],
        firstSetup: true
    },
        function (data) {
            setupList = data.options
            firstSetup = data.firstSetup

            setupOptions = document.querySelectorAll(".setup-option")
            setupOptions.forEach((option) => {
                option.addEventListener("click", () => {
                    selectOption(option.id)
                });
            })

            document.getElementById("confirm-button-spacer").style.marginTop = document.getElementById("confirm-button-wrapper").clientHeight + "px"

            document.getElementById("confirm-button").addEventListener("click", () => {
                saveOptions()
            });

            document.getElementById("settings-button").addEventListener("click", () => {
                displaySetup()
            });

            setupList.forEach((element) => {
                document.getElementById(element).classList.add("setup-option-selected")
            })

            if (firstSetup) {
                displaySetup()
            } else {
                displayMain()
            }
        }
    );
})

function selectOption(option) {
    optionElement = document.getElementById(option)
    optionContent = optionElement.innerHTML
    if (setupList.includes(option)) {
        const index = setupList.indexOf(option);
        setupList.splice(index, 1);
        optionElement.classList.remove("setup-option-selected")
    } else {
        setupList.push(option)
        optionElement.classList.add("setup-option-selected")
    }
}

function saveOptions() {
    document.getElementById("confirm-button").innerHTML = "Saving..."

    firstSetup = false
    chrome.storage.local.set({
        options: setupList,
        firstSetup: firstSetup
    }, function () {
        document.getElementById("confirm-button").innerHTML = "Confirm"
        displayMain()
    });
}

function displaySetup() {
    document.getElementById("setup-section").style.display = "flex"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
    document.getElementById("main-section").style.display = "none"
}

function displayLoading() {
    document.getElementById("loading-section").style.display = "flex"
    document.getElementById("main-section").style.display = "none"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
}

function displayResults() {
    document.getElementById("result-section").style.display = "flex"
    document.getElementById("main-section").style.display = "none"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("loading-section").style.display = "none"
}

function displayMain() {
    document.getElementById("main-section").style.display = "flex"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
}