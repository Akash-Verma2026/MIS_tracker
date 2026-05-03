//import { jsPDF } from "jspdf";
let filters = {
category: "all",
type:"all",
leader: "all",
potential: "all",
search: ""
}

let allProjects = []


let role = "viewer"

// GET USER ROLE
async function getUserRole(){
    

const { data: { user } } = await supabaseClient.auth.getUser()
if(!user){
window.location = "index.html"
return
} 
const { data } = await supabaseClient
.from("user_roles")
.select("role")
.eq("user_id", user.id)
.single()
console.log("Logged user:", user.email)
console.log("Role row:", data)
role = data?.role || "viewer"

console.log("Final role:", role)

if(role === "admin"){
document.getElementById("addProjectBtn").style.display = "inline-block"
}else{
document.getElementById("addProjectBtn").style.display = "none"
}

loadProjects()
}


// LOAD PROJECTS
async function loadProjects(){

const { data, error } = await supabaseClient
.from("mis_tracker")
.select("*")
.order("id", { ascending: true })

const leaderSet = new Set()

data.forEach(p => {
  if (p.project_leader) {
    leaderSet.add(p.project_leader)
  }
})

const leaderFilter = document.getElementById("leaderFilter")

// clear old options except first
leaderFilter.innerHTML = '<option value="all">All Leaders</option>'

// add new options dynamically
leaderSet.forEach(leader => {
  const option = document.createElement("option")
  option.value = leader
  option.textContent = leader
  leaderFilter.appendChild(option)
})
const typeSet = new Set()

data.forEach(p => {
  if (p.type) {
    typeSet.add(p.type)
  }
})

const typeFilter = document.getElementById("typeFilter")

typeFilter.innerHTML = '<option value="all">All Types</option>'

typeSet.forEach(type => {
  const option = document.createElement("option")
  option.value = type
  option.textContent = type
  typeFilter.appendChild(option)
})
if(error){
console.error(error)
alert(error.message)
return
}

allProjects = data

 renderTable(allProjects)
 updateDashboardCounts(allProjects)
 //generateAIReport()

 }
 function renderTable(projects = allProjects){

// const tbody = document.getElementById("tableBody")
const tbody = document.querySelector("#projectTable tbody")
tbody.innerHTML = ""

projects.forEach(p => {

let row = document.createElement("tr")

row.innerHTML = `
<td>${p.project_code || "-"}</td>
<td>${p.ref_id || "-"}</td>
<td>${p.project_customer || "-"}</td>
<td>${p.type || "-"}</td>
<td>${p.category || "-"}</td>
<td>${p.location || "-"}</td>
<td>${p.business_potential || "-"}</td>
<td>${p.level || "-"}</td>
<td>${p.project_brief || "-"}</td>
<td>${p.last_status || "-"}</td>
<td>${p.next_action_plan || "-"}</td>
<td>${p.project_leader || "-"}</td>
<td>${p.sub_leader || "-"}</td>
<td>${p.members_roll_no || "-"}</td>
<td>${formatDate(p.updated_at || p.created_at)}</td>

<td>
<button onclick="generateReport(${p.id})">Report</button>
${role !== "viewer" ? `<button onclick="editProject(${p.id})">Edit</button>` : ""}
${role === "admin" ? `<button onclick="deleteProject(${p.id})">Delete</button>` : ""}
</td>
`

tbody.appendChild(row)

})

}

// UPDATE STATUS
async function updateStatus(id,value){

await supabaseClient
.from("mis_tracker")
.update({
last_status: value,
updated_at: new Date()
})
.eq("id", id)
alert("Status updated successfully")

loadProjects()

}


// UPDATE ACTION PLAN
async function updateAction(id,value){

await supabaseClient
.from("mis_tracker")
.update({
next_action_plan: value,
updated_at: new Date()
})
.eq("id", id)
alert("Action plan updated successfully")

loadProjects()

}


// DELETE PROJECT (ADMIN ONLY)
async function deleteProject(id){

if(!confirm("Delete this project?")) return

await supabaseClient
.from("mis_tracker")
.delete()
.eq("id", id)

loadProjects()

}
async function logout(){
await supabaseClient.auth.signOut()
window.location = "index.html"
}


async function editProject(id){

const { data } = await supabaseClient
.from("mis_tracker")
.select("*")
.eq("id", id)
.single()

openForm()
document.getElementById("f_project_code").value = data.project_code
document.getElementById("f_ref_id").value = data.ref_id
document.getElementById("f_project_customer").value = data.project_customer
document.getElementById("f_type").value = data.type
document.getElementById("f_category").value = data.category
document.getElementById("f_location").value = data.location
document.getElementById("f_business_potential").value = data.business_potential
document.getElementById("f_level").value = data.level
document.getElementById("f_project_brief").value = data.project_brief
document.getElementById("f_last_status").value = data.last_status
document.getElementById("f_next_action_plan").value = data.next_action_plan
document.getElementById("f_project_leader").value = data.project_leader
document.getElementById("f_sub_leader").value = data.sub_leader
document.getElementById("f_members_roll_no").value = data.members_roll_no
// document.getElementById("f_drive_link").value = data.drive_link

window.editingId = id

}


async function addProject(){

// if(role === "admin"){
// document.getElementById("addProjectBtn").style.display = "inline-block"
// }else{
// document.getElementById("addProjectBtn").style.display = "none"
// }

const project_code = prompt("Project Code")
const ref_id = prompt("Ref ID")
const project_customer = prompt("Project / Customer")
const type = prompt("Type")
const category = prompt("Category")
const location = prompt("Location")
const business_potential = prompt("Business Potential")
const level = prompt("Level")
const project_brief = prompt("Project Brief")
const last_status = prompt("Last Status")
const next_action_plan = prompt("Next Action Plan")
const project_leader = prompt("Project Leader")
const sub_leader = prompt("Sub Leader")
const members_roll_no = prompt("Members Roll No")

await supabaseClient
.from("mis_tracker")
.insert([{
project_code,
ref_id,
project_customer,
type,
category,
location,
business_potential,
level,
project_brief,
last_status,
next_action_plan,
project_leader,
sub_leader,
members_roll_no,
updated_at: new Date()
}])

loadProjects()

}

function openForm(){

if(role === "viewer"){
alert("Viewers cannot edit projects")
return
}

document.getElementById("formOverlay").style.display = "flex"

}

function closeForm(){

document.getElementById("formOverlay").style.display = "none"
}

async function saveProject(){

if(role === "viewer"){
alert("Viewers cannot edit projects")
return
}

const project_code = document.getElementById("f_project_code").value
const ref_id = document.getElementById("f_ref_id").value
const project_customer = document.getElementById("f_project_customer").value
let type = document.getElementById("f_type").value
const customType = document.getElementById("f_type_custom").value

if(type === "Others" && customType){
  type = customType
}
const category = document.getElementById("f_category").value
const location = document.getElementById("f_location").value
const business_potential = document.getElementById("f_business_potential").value
const level = document.getElementById("f_level").value
const project_brief = document.getElementById("f_project_brief").value
const last_status = document.getElementById("f_last_status").value
const next_action_plan = document.getElementById("f_next_action_plan").value
const project_leader = document.getElementById("f_project_leader").value
const sub_leader = document.getElementById("f_sub_leader").value
const members_roll_no = document.getElementById("f_members_roll_no").value
let query

if(window.editingId){

query = supabaseClient
.from("mis_tracker")
.update({
 project_code,
 ref_id,
 project_customer,
 type,
 category,
 location,
 business_potential,
 level,
 project_brief,
 last_status,
 next_action_plan,
 project_leader,
 sub_leader,
 members_roll_no,
 updated_at: new Date()   // ✅ ADD THIS
})
.eq("id", window.editingId)

}else{

query = supabaseClient
.from("mis_tracker")
.insert([{
project_code,
ref_id,
project_customer,
type,
category,
location,
business_potential,
level,
project_brief,
last_status,
next_action_plan,
project_leader,
sub_leader,
members_roll_no,
updated_at: new Date()
}])

if(type === "Others" && !customType){
  alert("Please enter custom type")
  return
}
}

await query

window.editingId = null
loadProjects()
closeForm()
document.querySelectorAll("#projectForm input, #projectForm select")
.forEach(el => el.value = "")

}

function updateDashboardCounts(data) {

let customer = 0
let rd = 0
let others = 0 
let hold = 0
let completed = 0

data.forEach(p => {

let category = (p.category || "").toLowerCase()
let status = (p.last_status || "").toLowerCase()

// ✅ COMPLETED BASED ON STATUS
if (status.includes("complete")) {
  completed++
  return // skip counting in other categories
}

if(category.includes("customer")) customer++
else if(category.includes("r&d")) rd++
else if(category.includes("hold")) hold++
else others++


})

document.getElementById("customerProjects").innerText = customer
document.getElementById("rdProjects").innerText = rd
document.getElementById("otherProjects").innerText = others
document.getElementById("holdProjects").innerText = hold
document.getElementById("completedProjects").innerText = completed
document.getElementById("totalProjects").innerText = data.length

}

// function populateLeaders(){

// let dropdown = document.getElementById("leaderFilter")
// dropdown.innerHTML = '<option value="all">All Leaders</option>'

// let leaders = new Set()

// document.querySelectorAll("#projectTable tbody tr").forEach(row => {

//  let leader = row.children[11]?.innerText.trim()

// if(leader && leader !== "-"){
// leaders.add(leader)
// }

// })

// leaders.forEach(name => {

// let option = document.createElement("option")
// option.value = name
// option.textContent = name

// dropdown.appendChild(option)

// })

// }
function filterProjects(category) {

  if(category === "all"){
    filters = {
      category: "all",
      type: "all",
      leader: "all",
      potential: "all",
      search: ""
    }

    document.getElementById("leaderFilter").value = "all"
    document.getElementById("potentialFilter").value = "all"
    document.getElementById("typeFilter").value = "all"
    document.getElementById("searchInput").value = ""
  } else {
    filters.category = category
  }

  applyFilters()
}


function formatDate(dateString){

const date = new Date(dateString)

const options = {
day: "2-digit",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit"
}

return date.toLocaleString("en-IN", options)

}
function generateExcel() {

let table = document.getElementById("projectTable")

let workbook = XLSX.utils.table_to_book(table, { sheet: "Projects" })

XLSX.writeFile(workbook, "MIS_Project_Data.xlsx")

}
// LEADER FILTER
document.getElementById("leaderFilter").addEventListener("change", function(){

filters.leader = this.value
applyFilters()

})


// POTENTIAL FILTER
document.getElementById("potentialFilter").addEventListener("change", function(){

filters.potential = this.value
applyFilters()

})

document.getElementById("searchInput").addEventListener("input", function () {
  filters.search = this.value.toLowerCase()
  applyFilters()
})
// TYPE FILTER
document.getElementById("typeFilter").addEventListener("change", function(){
  filters.type = this.value
  applyFilters()
})



function applyFilters() {

  let filteredData = [...allProjects]

  // 🔍 SEARCH
  if (filters.search) {
    filteredData = filteredData.filter(p =>
      (p.project_code || "").toLowerCase().includes(filters.search) ||
      (p.project_customer || "").toLowerCase().includes(filters.search) ||
      (p.project_leader || "").toLowerCase().includes(filters.search) ||
      (p.last_status || "").toLowerCase().includes(filters.search) ||
      (p.ref_id || "").toLowerCase().includes(filters.search)
    )
  }

  // 👤 LEADER
  if (filters.leader !== "all") {
    filteredData = filteredData.filter(p =>
      (p.project_leader || "").toLowerCase() === filters.leader.toLowerCase()
    )
  }

  // 💰 POTENTIAL
  if (filters.potential !== "all") {
    filteredData = filteredData.filter(p =>
      (p.business_potential || "").toLowerCase() === filters.potential.toLowerCase()
    )
  }

  // 🧩 CATEGORY
  if (filters.category !== "all") {
    // if (filters.category === "Customer") {
    //   filteredData = filteredData.filter(p =>
    //     (p.category || "").toLowerCase().includes("customer")
    //   )
    // }
    if (filters.category === "Customer") {
  filteredData = filteredData.filter(p =>
    !(p.last_status || "").toLowerCase().includes("complete") &&
    (p.category || "").toLowerCase().includes("customer")
  )
}

    // if (filters.category === "R&D") {
    //   filteredData = filteredData.filter(p =>
    //     (p.category || "").toLowerCase().includes("r&d")
    //   )
    // }
    if (filters.category === "R&D") {
  filteredData = filteredData.filter(p =>
    !(p.last_status || "").toLowerCase().includes("complete") &&
    (p.category || "").toLowerCase().includes("r&d")
  )
}

    // if (filters.category === "On Hold") {
    //   filteredData = filteredData.filter(p =>
    //     (p.category || "").toLowerCase().includes("hold")
    //   )
    // }
    if (filters.category === "Others") {
  filteredData = filteredData.filter(p => {

    let status = (p.last_status || "").toLowerCase()
    let category = (p.category || "").toLowerCase().trim()

    return !status.includes("complete") &&
           !category.includes("customer") &&
           !category.includes("r&d") &&
           !category.includes("hold")
  })
}
    if (filters.category === "On Hold") {
  filteredData = filteredData.filter(p =>
    !(p.last_status || "").toLowerCase().includes("complete") &&
    (p.category || "").toLowerCase().includes("hold")
  )
}
   if (filters.category === "Completed") {
  filteredData = filteredData.filter(p =>
      (p.last_status || "").toLowerCase().includes("complete")
      )
    }
  }

  // ✅ TYPE FILTER (INSIDE FUNCTION)
  if (filters.type !== "all") {
    filteredData = filteredData.filter(p =>
      (p.type || "").toLowerCase() === filters.type.toLowerCase()
    )
  }

  // 🔥 FINAL
  renderTable(filteredData)
  updateDashboardCounts(allProjects)
}
function handleTypeChange() {
  const typeSelect = document.getElementById("f_type")
  const customInput = document.getElementById("f_type_custom")

  if (typeSelect.value === "Others") {
    customInput.style.display = "block"
  } else {
    customInput.style.display = "none"
    customInput.value = ""
  }
}
// ===============================
// 🧠 DECISION ENGINE (STEP 2)
// ===============================
function getNextAction(p, score) {
  let status = (p.last_status || "").toLowerCase()

  if (score < 40) {
    return "🚨 Escalate immediately and assign senior owner."
  }

  if (status.includes("waiting")) {
    return "⏳ Follow up within 24 hours."
  }

  if (status.includes("delay")) {
    return "⚠️ Identify delay cause and re-plan timeline."
  }

  if (!p.next_action_plan) {
    return "❗ Define clear next action."
  }

  if ((p.business_potential || "").toLowerCase() === "high") {
    return "🚀 Prioritize and push for closure."
  }

  return "✅ Continue normal execution."
}

// ===============================
// 📄 SUMMARY GENERATOR (STEP 5)
// ===============================
function generateSummary(data) {
  if (data.score > 80) {
    return "Project is performing well with minimal risks."
  }
  if (data.score > 50) {
    return "Project has moderate risks and needs monitoring."
  }
  return "Project is at high risk and requires immediate action."
}

// ===============================
// ⚙️ RULE ENGINE (STEP 1)
// ===============================
function processProjects(projects) {
  return projects.map(p => {

    let score = 100

    let status = (p.last_status || "").toLowerCase()
    let bp = (p.business_potential || "").toLowerCase()
    let action = (p.next_action_plan || "").toLowerCase()

    let category = (p.category || "").toLowerCase()

    // 🔻 scoring
    if (status.includes("delay")) score -= 30
    else if (status.includes("waiting")) score -= 20

    if (bp === "low") score -= 25
    else if (bp === "medium") score -= 10

    if (!action) score -= 25
    
if (category.includes("hold")) {
  score = Math.min(score, 50)
}

    if (score < 0) score = 0

    // 🔻 health + risk
    let health = "Excellent"
    let risk = "Low"

    if (score < 40) {
      health = "Critical"
      risk = "Very High"
    } else if (score < 60) {
      health = "Weak"
      risk = "High"
    } else if (score < 80) {
      health = "Moderate"
      risk = "Medium"
    }

    // 🔻 decision engine
    let nextAction = getNextAction(p, score)

    return {
      ...p,
      score,
      health,
      risk,
      nextAction
    }
  })
}

// ===============================
// 📊 BUILD REPORT (MAIN FUNCTION)
// ===============================
function buildHealthReport(projects) {

  // ✅ Process all projects
  const processed = processProjects(projects)

  // 👉 pick first project (you can improve later)
  const p = processed[0]

  let status = (p.last_status || "").toLowerCase()

  // 🔍 ISSUES
  let issues = []

  if (status.includes("waiting")) {
    issues.push("Waiting for customer response")
  }
  if (status.includes("quotation")) {
    issues.push("Quotation pending")
  }
  if (status.includes("dispatch")) {
    issues.push("Dispatch not completed")
  }

  // 💡 INSIGHTS
  let insights = []

  if (status.includes("waiting")) {
    insights.push("Project is dependent on external response")
  }
  if (!p.business_potential) {
    insights.push("No clear revenue visibility")
  }

  insights.push("Resource utilization needs monitoring")

  // 🚀 RECOMMENDATIONS
  let recommendations = {
    immediate: [
      "Follow up with customer within 24–48 hrs",
      "Close pending quotation tasks",
      "Assign single point of ownership"
    ],
    shortTerm: [
      "Set strict response deadlines",
      "Re-evaluate feasibility"
    ],
    strategic: [
      "If no response in 7 days → Move to Hold/Drop decision"
    ]
  }

  // 🧠 FINAL DECISION
  let finalDecision = "Continue project"

  if (p.score < 50) {
    finalDecision = "Consider stopping or restructuring project"
  } else if (p.score < 80) {
    finalDecision = "Continue with caution"
  }

  // 📄 SUMMARY
  let summary = generateSummary(p)

  // ✅ FINAL DATA
  const finalData = {
    score: p.score,
    health: p.health,
    risk: p.risk,
    nextAction: p.nextAction,
    issues,
    insights,
    recommendations,
    finalDecision,
    summary
  }

  // 💾 SAVE
  localStorage.setItem("reportData", JSON.stringify(finalData))

  // 🚀 OPEN REPORT
  window.open("report.html", "_blank")
}


async function generateReport(id){

  const project = allProjects.find(p => p.id === id)

  const processed = processProjects([project])[0]
  const aiData = await getAIReport(project)
  //const aiData = await getAIReport(allProjects)

  let finalDecision = (aiData.decisions || []).join(", ") || "Manual review required"

  if (project.category?.toLowerCase().includes("hold")) {
    finalDecision = "Project is currently on hold — requires management review"
  }

  const finalData = {
    ...processed,

    overview: aiData.summary || "",
    healthSummary: aiData.summary || "",

    issues: aiData.risks || [],
    insights: aiData.insights || [],

    recommendations: {
      immediate: Array.isArray(aiData.recommendations)
        ? aiData.recommendations
        : [],
      shortTerm: Array.isArray(aiData.priority_actions)
        ? aiData.priority_actions
        : [],
      strategic: []
    },

    finalDecision: finalDecision,

    executiveSummary: generateExecutiveSummary(processed)
  }

  // ✅ THIS WAS MISSING
  localStorage.setItem("reportData", JSON.stringify(finalData))

  // ✅ THIS WAS MISSING
  window.open("report.html", "_blank")
}


function downloadReport(p) {
  // const { jsPDF } = window.jspdf;
  // const doc = new jsPDF();
const doc = new window.jspdf.jsPDF();
  let y = 15;

  doc.setFontSize(16);
  doc.text("PROJECT HEALTH REPORT", 105, y, { align: "center" });
  y += 10;

  doc.line(10, y, 200, y);
  y += 8;

  // Helper for page break
  const checkPage = () => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // Overview
  doc.setFont("helvetica", "bold");
  doc.text("Project Overview", 10, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  let lines = doc.splitTextToSize(p.overview || "", 180);
  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 5;
    checkPage();
  });

  y += 5;

  // Health Summary
  doc.setFont("helvetica", "bold");
  doc.text("Health Summary", 10, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  lines = doc.splitTextToSize(p.healthSummary || "", 180);
  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 5;
    checkPage();
  });

  y += 5;

  // Issues
  doc.setFont("helvetica", "bold");
  doc.text("Key Issues", 10, y);
  y += 6;

  (p.issues || []).forEach(i => {
    doc.text("- " + i, 10, y);
    y += 5;
    checkPage();
  });

  y += 5;

  // Insights
  doc.setFont("helvetica", "bold");
  doc.text("Business Insights", 10, y);
  y += 6;

  (p.insights || []).forEach(i => {
    doc.text("- " + i, 10, y);
    y += 5;
    checkPage();
  });

  y += 5;

  // Recommendations
  doc.setFont("helvetica", "bold");
  doc.text("Recommendations", 10, y);
  y += 6;

  [
    ...(p.recommendations?.immediate || []),
    ...(p.recommendations?.shortTerm || []),
    ...(p.recommendations?.strategic || [])
  ].forEach(i => {
    doc.text("- " + i, 10, y);
    y += 5;
    checkPage();
  });

  y += 5;

  // Final Decision
  doc.setFont("helvetica", "bold");
  doc.text("Final Decision", 10, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  lines = doc.splitTextToSize(p.finalDecision || "", 180);

  lines.forEach(line => {
    doc.text(line, 10, y);
    y += 5;
    checkPage();
  });

  doc.save("AI_Report.pdf");
}

function generateExecutiveSummary(p){

let summary = ""

// 🧠 HEALTH BASED
if(p.score > 80){
  summary += `The project "${p.project_customer}" is performing strongly with stable execution and minimal risk exposure. `
}
else if(p.score > 50){
  summary += `The project "${p.project_customer}" is progressing at a moderate level with certain operational risks that require monitoring. `
}
else{
  summary += `The project "${p.project_customer}" is currently underperforming and exposed to significant risks impacting delivery timelines. `
}

// 🔍 STATUS BASED
let status = (p.last_status || "").toLowerCase()

if(status.includes("waiting")){
  summary += "Progress is currently dependent on external stakeholder response, which is causing delays in execution. "
}
else if(status.includes("delay")){
  summary += "Execution delays have been observed, indicating gaps in planning or coordination. "
}
else{
  summary += "Execution is ongoing without major external blockers. "
}

// 💰 BUSINESS SIDE
if((p.business_potential || "").toLowerCase() === "high"){
  summary += "From a business perspective, the project holds strong potential and justifies continued investment and focus. "
}
else if((p.business_potential || "").toLowerCase() === "low"){
  summary += "Business value appears limited, and further investment should be carefully evaluated. "
}
else{
  summary += "Business potential is currently unclear and requires better definition. "
}

// 📊 FINAL INSIGHT
summary += "Improved monitoring, ownership accountability, and structured follow-ups will be critical to ensuring successful project outcomes."

return summary
}


function generateScoreChart(score){

const canvas = document.createElement("canvas")
canvas.width = 400
canvas.height = 200
const ctx = canvas.getContext("2d")

// background
ctx.fillStyle = "#ffffff"
ctx.fillRect(0,0,400,200)

// axis
ctx.strokeStyle = "#ccc"
ctx.beginPath()
ctx.moveTo(40,160)
ctx.lineTo(360,160)
ctx.stroke()

// bar
ctx.fillStyle = score > 70 ? "#2e7d32" : score > 50 ? "#f9a825" : "#c62828"
ctx.fillRect(60, 160 - score, 80, score)

// label
ctx.fillStyle = "#000"
ctx.font = "12px Arial"
ctx.fillText("Score", 70, 180)
ctx.fillText(score, 80, 140 - score)

return canvas.toDataURL("image/png")
}

async function getBase64Image(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}
async function getAIReport(project) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_ANTHROPIC_API_KEY_HERE",   // ← paste your key
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are a senior business analyst. Analyze this project data and return ONLY valid JSON with no markdown or backticks.

Return exactly this structure:
{
  "summary": "overall project summary",
  "risks": ["risk1", "risk2"],
  "recommendations": ["rec1", "rec2"],
  "decisions": ["decision1"],
  "insights": ["insight1", "insight2"],
  "priority_actions": ["action1", "action2"]
}

Project data:
${JSON.stringify(project)}`
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || ""
    const clean = text.replace(/```json|```/g, "").trim()
    return JSON.parse(clean)

  } catch (err) {
    console.error("AI Error:", err)

    // ✅ FALLBACK with real rule-based data (not empty!)
    const processed = processProjects([project])[0]
    const status = (project.last_status || "").toLowerCase()

    return {
      summary: generateExecutiveSummary(processed),
      risks: [
        status.includes("waiting") ? "Waiting on external response" : "Execution risk detected",
        (project.business_potential || "").toLowerCase() === "low" ? "Low business potential" : "Market risk"
      ].filter(Boolean),
      recommendations: [
        "Follow up with stakeholders within 48 hours",
        "Review project timeline and milestones",
        "Assign clear ownership for next action"
      ],
      decisions: [processed.score < 50 ? "Escalate for management review" : "Continue with monitoring"],
      insights: [
        `Business potential: ${project.business_potential || "Not defined"}`,
        `Current status: ${project.last_status || "Not updated"}`,
        "Resource utilization needs monitoring"
      ],
      priority_actions: [
        project.next_action_plan || "Define next action plan",
        "Schedule progress review meeting"
      ]
    }
  }
}
async function generateAIReport() {

  const projects = allProjects; // already in your code

  const res = await fetch("http://localhost:3000/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
     body: JSON.stringify({ projects: allProjects })
  });

  const data = await res.json();

document.getElementById("aiReportBox").innerHTML = `
<h3>📊 Summary</h3>
<p>${data.summary || ""}</p>

<h3>⚠️ Risks</h3>
<ul>${(data.risks || []).map(r => `<li>${r}</li>`).join("")}</ul>

<h3>🧠 Decisions</h3>
<ul>${(data.decisions || []).map(d => `<li>${d}</li>`).join("")}</ul>

<h3>📈 Insights</h3>
<ul>${(data.insights || []).map(i => `<li>${i}</li>`).join("")}</ul>
`
}

// START APP
getUserRole()