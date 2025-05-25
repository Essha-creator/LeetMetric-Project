

document.addEventListener("DOMContentLoaded", function(){
    const searchButton = document.getElementById("search-btn");
    const userInput = document.getElementById("user-input");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.querySelector("#easy-label");
    const mediumLabel = document.querySelector("#medium-label");
    const hardLabel = document.querySelector("#hard-label");
    const statsCardContainer = document.querySelector(".stats-card");
    const statsContainer = document.querySelector(".stats_container")

    function validateUsername(username){
        if (username.trim()===""){
            alert("username should not be empty");
            return false
        }
        const regex =  /^(?![_-])[a-zA-Z0-9_-]{3,16}(?<![_-])$/;
        const isMatching = regex.test(username);
        if (!isMatching){
            alert("Invalid username")
        }
        return isMatching


    }

    async function fetchUserDetails(username){
       
        searchButton.textContent = "Searching....";
        searchButton.disabled=true;
        statsContainer.style.setProperty("visibility","hidden")

        try{
            const proxy_server = 'https://cors-anywhere.herokuapp.com/'
            const target = 'https://leetcode.com/graphql/'
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json")


            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
            })

            const requestOptions = {
                method:"POST",
                headers: myHeaders,
                body: graphql,
                redirect:"follow"
            }
            

            const response = await fetch(proxy_server+target,requestOptions);
            if(!response.ok){
                throw new Error('Unable to fetch the user details')
            }
            const parsedData = await response.json();
            console.log("Logging Data: ", parsedData)
            displayUserDetails(parsedData)
            statsContainer.style.setProperty("visibility","visible")
        }
        catch(error){
            statsContainer.innerHTML= `<p>${error.message}</p>`

        }
        finally{
            searchButton.textContent='search';
            searchButton.disabled = false;

        }
        
    }
    function updateProgress(solved,total,label,circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent=`${solved}/${total}`;



    }
    function displayUserDetails(parsedData){
        const totalQuestions = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQuestions = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQuestions = parsedData.data.allQuestionsCount[2].count;
        const totalHardQuestions = parsedData.data.allQuestionsCount[3].count;

        const solvedTotal = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasy = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMedium = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHard = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasy,totalEasyQuestions,easyLabel, easyProgressCircle);
        updateProgress(solvedMedium,totalMediumQuestions,mediumLabel, mediumProgressCircle);
        updateProgress(solvedHard,totalHardQuestions,hardLabel, hardProgressCircle);

        const cardData = [
            {label:"Overall Submission", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label:"Overall Easy Submission", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label:"Overall Medium Submission", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label:"Overall Hard Submission", value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ];

        console.log("Card Data: ", cardData)

        statsCardContainer.innerHTML = cardData.map(
            data=>
                `<div class="cards">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>`
        ).join("")


    }




    searchButton.addEventListener('click',function(){
        const username = userInput.value;
        console.log("loggin username: ", username);
        if (validateUsername(username)){
            fetchUserDetails(username)
            

            
        }
    })








})