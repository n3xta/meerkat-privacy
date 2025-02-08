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

document.getElementById("start-crawl").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = tabs[0].url;
      fetch('http://127.0.0.1:5000/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: currentUrl })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          document.getElementById("crawl-result").innerText = '错误：' + data.error;
        } else {
          document.getElementById("crawl-result").innerText = data.text;
          callChatGPT(data.text);
        }
      })
      .catch(err => {
        document.getElementById("crawl-result").innerText = '爬取出错：' + err;
      });
    });
  });
  
  function callChatGPT(crawledText) {
    const apiKey = "poopoo heads"; 
  
    const prompt = `请基于以下文本生成一份隐私条款报告，指出该网站是否存在侵犯用户隐私的风险，并列出关键点：\n\n${crawledText}`;
  
    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    })
    .then(response => response.json())
    .then(data => {
      let gptText = "";
      if (data.choices && data.choices.length > 0) {
        gptText = data.choices[0].text.trim();
      } else {
        gptText = "未生成报告，请重试。";
      }
      document.getElementById("chatgpt-content").innerText = gptText;
    })
    .catch(error => {
      console.error("调用 ChatGPT API 出错：", error);
      document.getElementById("chatgpt-content").innerText = "调用 ChatGPT API 出错：" + error;
    });
  }  