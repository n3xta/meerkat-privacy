var setupList = []
var firstSetup = true

var section1GradientValue = 0
var section2GradientValue = 0
var section3GradientValue = 0
var section4GradientValue = 0

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
                var sectionNumber = 1
                if (option.classList.contains("so-1")) {
                    sectionNumber = 1
                } else if (option.classList.contains("so-2")) {
                    sectionNumber = 2
                } else if (option.classList.contains("so-3")) {
                    sectionNumber = 3
                } else if (option.classList.contains("so-4")) {
                    sectionNumber = 4
                }

                option.addEventListener("click", () => {
                    selectOption(option.id, sectionNumber)
                });
            })

            document.getElementById("confirm-button").addEventListener("click", () => {
                saveOptions()
            });

            document.getElementById("settings-button-r").addEventListener("click", () => {
                displaySetup()
            });

            document.getElementById("settings-button-m").addEventListener("click", () => {
                displaySetup()
            });

            document.getElementById("summary-expand-button").addEventListener("click", () => {
                expandSummary()
            });

            setupList.forEach((element) => {
                var currentElement = document.getElementById(element)
                currentElement.classList.add("setup-option-selected")
                if (currentElement.classList.contains("so-1")) {
                    section1GradientValue += 1
                } else if (currentElement.classList.contains("so-2")) {
                    section2GradientValue += 1
                } else if (currentElement.classList.contains("so-3")) {
                    section3GradientValue += 1
                } else if (currentElement.classList.contains("so-4")) {
                    section4GradientValue += 1
                }
            })

            if (firstSetup) {
                displaySetup()
            } else {
                displayMain()
            }

            updateGradient()

            const startCrawlBtn = document.getElementById("start-crawl");
            if (startCrawlBtn) {
                startCrawlBtn.addEventListener("click", () => {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentUrl = tabs[0].url;
                        
                        chrome.storage.local.get("options", (data) => {
                            const userPreferences = data.options || [];
                
                            fetch('http://64.227.2.159:5000/crawl_and_summarize', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    url: currentUrl,
                                    preferences: userPreferences
                                })
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.error) {
                                    document.getElementById("chatgpt-content").innerText = "错误：" + data.error;
                                } else {
                                    displayResults()
                                    document.getElementById("summary").innerText = data.summary;
                                }
                            })
                            .catch(err => {
                                document.getElementById("chatgpt-content").innerText = "请求失败：" + err;
                            });
                        });
                    });
                });                
            } else {
                console.error("无法找到 id 为 'start-crawl' 的元素！");
            }
        }
    );
})

function updateGradient() {
    document.documentElement.style.setProperty("--gradient-1", 100 - section1GradientValue / 3 * 100 + "%")
    document.documentElement.style.setProperty("--gradient-2", 100 - section2GradientValue / 3 * 100 + "%")
    document.documentElement.style.setProperty("--gradient-3", 100 - section3GradientValue / 3 * 100 + "%")
    document.documentElement.style.setProperty("--gradient-4", 100 - section4GradientValue / 3 * 100 + "%")
}

function selectOption(option, sectionNumber) {
    optionElement = document.getElementById(option)
    optionContent = optionElement.innerHTML

    delta = 0

    if (setupList.includes(option)) {
        const index = setupList.indexOf(option);
        setupList.splice(index, 1);
        optionElement.classList.remove("setup-option-selected")
        delta = -1
    } else {
        setupList.push(option)
        optionElement.classList.add("setup-option-selected")
        delta = 1
    }

    if (sectionNumber == 1) {
        section1GradientValue += delta
    } else if (sectionNumber == 2) {
        section2GradientValue += delta
    } else if (sectionNumber == 3) {
        section3GradientValue += delta
    } else if (sectionNumber == 4) {
        section4GradientValue += delta
    }

    updateGradient()
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

function expandSummary() {
    summaryText = document.getElementById("summary")
    expandIcon = document.getElementById("expand-icon")
    if (summaryText.style.display != "block") {
        summaryText.style.display = "block"
        expandIcon.style.transform = "rotate(180deg)"
    } else {
        summaryText.style.display = "-webkit-box"
        expandIcon.style.transform = "rotate(0deg)"
    }
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