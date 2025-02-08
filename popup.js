var setupList = []
var oldSetupList = []
var firstSetup = true
var hasResult = false

var section1GradientValue = 0
var section2GradientValue = 0
var section3GradientValue = 0
var section4GradientValue = 0

document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get({
        options: [],
        firstSetup: true,
        url: "",
        overallScore: 0,
        summary: "",
        subScores: []
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

            document.getElementById("error-button").addEventListener("click", () => {
                displayMain()
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

            updateGradient()

            if (firstSetup) {
                displaySetup()
            } else if (data.url != "") {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const tabURL = tabs[0].url;
                    if (data.url == tabURL) {
                        hasResult = true
                        displayResults()
                        // document.getElementById("result-quote").innerText = data.quote;
                        document.getElementById("result-summary").innerText = data.summary;
                        document.getElementById("result-overall").innerText = data.overallScore;
                        document.documentElement.style.setProperty("--overall", data.overallScore * 10)

                        document.getElementById("result-sub-1").innerText = data.subScores[0];
                        document.documentElement.style.setProperty("--bar-score-1", data.subScores[0] * 10 + "%")

                        document.getElementById("result-sub-2").innerText = data.subScores[1];
                        document.documentElement.style.setProperty("--bar-score-2", data.subScores[1] * 10 + "%")

                        document.getElementById("result-sub-3").innerText = data.subScores[2];
                        document.documentElement.style.setProperty("--bar-score-3", data.subScores[2] * 10 + "%")

                        document.getElementById("result-sub-4").innerText = data.subScores[3];
                        document.documentElement.style.setProperty("--bar-score-4", data.subScores[3] * 10 + "%")
                    } else {
                        displayMain()
                    }
                })
            } else {
                displayMain()
            }

            const startCrawlBtn = document.getElementById("start-crawl");
            startCrawlBtn.addEventListener("click", () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const currentUrl = tabs[0].url;

                    chrome.storage.local.get("options", (data) => {
                        const userPreferences = data.options || [];
                        displayLoading()
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
                                console.log("Received data:", data);
                                if (data.error) {
                                    displayError()
                                    document.getElementById("error-text").innerText = "There has been an error";
                                } else {
                                    displayResults()
                                    // document.getElementById("result-quote").innerText = data.quote;
                                    document.getElementById("result-summary").innerText = data.summary;

                                    var totalScore = calculateTotalScore(data.subscore_user, data.subscore_data, data.subscore_network, data.subscore_ads);
                                    document.getElementById("result-overall").innerText = totalScore
                                    document.documentElement.style.setProperty("--overall", totalScore * 10)

                                    document.getElementById("result-sub-1").innerText = data.subscore_user;
                                    document.documentElement.style.setProperty("--bar-score-1", data.subscore_user * 10 + "%")

                                    document.getElementById("result-sub-2").innerText = data.subscore_data;
                                    document.documentElement.style.setProperty("--bar-score-2", data.subscore_data * 10 + "%")

                                    document.getElementById("result-sub-3").innerText = data.subscore_network;
                                    document.documentElement.style.setProperty("--bar-score-3", data.subscore_network * 10 + "%")

                                    document.getElementById("result-sub-4").innerText = data.subscore_ads;
                                    document.documentElement.style.setProperty("--bar-score-4", data.subscore_ads * 10 + "%")

                                    chrome.storage.local.set({
                                        url: currentUrl,
                                        overallScore: totalScore,
                                        summary: data.summary,
                                        subScores: [data.subscore_user, data.subscore_data, data.subscore_network, data.subscore_ads]
                                    }, function () {
                                    });
                                }
                            })
                            .catch(err => {
                                displayError()
                                document.getElementById("error-text").innerText = "There has been an error";
                            });
                    });
                });
            });
        }
    );
})

function calculateTotalScore(subScore1, subScore2, subScore3, subScore4) {
    var totalScore = 0
    var totalCategory = section1GradientValue + section2GradientValue + section3GradientValue + section4GradientValue
    if (totalCategory == 0) {
        totalScore += subScore1 * 1 / 4
        totalScore += subScore2 * 1 / 4
        totalScore += subScore3 * 1 / 4
        totalScore += subScore4 * 1 / 4
    } else {
        totalScore += subScore1 * section1GradientValue / totalCategory
        totalScore += subScore2 * section2GradientValue / totalCategory
        totalScore += subScore3 * section3GradientValue / totalCategory
        totalScore += subScore4 * section4GradientValue / totalCategory
    }

    return Math.round(totalScore)
}

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

    if (setupList.toString() != oldSetupList.toString()) {
        chrome.storage.local.set({
            options: setupList,
            firstSetup: firstSetup,
            url: "",
            overallScore: 0,
            summary: "",
            subScores: []
        }, function () {
            document.getElementById("confirm-button").innerHTML = "Confirm"
            displayMain()
        });
    } else {
        chrome.storage.local.set({
            firstSetup: firstSetup
        }, function () {
            document.getElementById("confirm-button").innerHTML = "Confirm"
            if (hasResult) {
                displayResults()
            } else {
                displayMain()
            }
        });
    }
}

function expandSummary() {
    summaryText = document.getElementById("result-summary")
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
    setupList.forEach((option) => {
        oldSetupList.push(option)
    })
    document.getElementById("setup-section").style.display = "flex"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("error-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
    document.getElementById("main-section").style.display = "none"
}

function displayLoading() {
    document.getElementById("loading-section").style.display = "flex"
    document.getElementById("error-section").style.display = "none"
    document.getElementById("main-section").style.display = "none"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
}

function displayError() {
    document.getElementById("error-section").style.display = "flex"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("main-section").style.display = "none"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
}

function displayResults() {
    document.getElementById("result-section").style.display = "flex"
    document.getElementById("main-section").style.display = "none"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("error-section").style.display = "none"
}

function displayMain() {
    document.getElementById("main-section").style.display = "flex"
    document.getElementById("setup-section").style.display = "none"
    document.getElementById("loading-section").style.display = "none"
    document.getElementById("error-section").style.display = "none"
    document.getElementById("result-section").style.display = "none"
}