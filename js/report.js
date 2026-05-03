const data = JSON.parse(localStorage.getItem("reportData")) || {}

// Fill values
document.getElementById("health").innerText = data.health
document.getElementById("risk").innerText = data.risk
document.getElementById("score").innerText = data.score

// Issues
document.getElementById("issues").innerHTML =
  data.issues.map(i => `<li>${i}</li>`).join("")

// Insights
document.getElementById("insights").innerHTML =
  data.insights.map(i => `<li>${i}</li>`).join("")

// Recommendations
const rec = data.recommendations || {}

document.getElementById("recommendations").innerHTML =
[
  ...(Array.isArray(rec.immediate) ? rec.immediate : []),
  ...(Array.isArray(rec.shortTerm) ? rec.shortTerm : []),
  ...(Array.isArray(rec.strategic) ? rec.strategic : [])
]
.map(r => `<li>${r}</li>`).join("")

// Decision
document.getElementById("decision").innerText = data.finalDecision
document.getElementById("nextAction").innerText = data.nextAction
document.getElementById("summary").innerText =
  data.executiveSummary || data.summary

// 📊 Chart
new Chart(document.getElementById("chart"), {
  type: "doughnut",
  data: {
    labels: ["Score", "Remaining"],
    datasets: [{
      data: [data.score, 100 - data.score]
    }]
  }
})