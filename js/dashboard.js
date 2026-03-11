let role = "viewer"

// GET USER ROLE
async function getUserRole(){
    

const { data: { user } } = await supabaseClient.auth.getUser()

if(!user){
window.location = "index.html"
return
}

// const { data } = await supabaseClient
// .from("user_roles")
// .select("role")
// .eq("user_id", user.id)
// .single()
// console.log("Logged user:", user.email)
// console.log("Role row:", data)

// if(data){
// role = data.role
// }

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
.order("updated_at",{ascending:false})
if(error){
console.error(error)
alert(error.message)
return
}

// dashboard cards

document.getElementById("totalProjects").innerText = data.length

const active = data.filter(p => p.last_status !== "Completed").length
const completed = data.filter(p => p.last_status === "Completed").length

document.getElementById("activeProjects").innerText = active
document.getElementById("completedProjects").innerText = completed



const tbody = document.getElementById("tableBody")

tbody.innerHTML = ""

if(!data) return

data.forEach(p => {

let statusClass = ""

if(p.last_status === "Planning") statusClass = "status-planning"
if(p.last_status === "In Progress") statusClass = "status-progress"
if(p.last_status === "On Hold") statusClass = "status-hold"
if(p.last_status === "Completed") statusClass = "status-completed"

// let statusBadge = `<span class="status ${statusClass}">${p.last_status}</span>`
  
//    let progress = 0

// if(p.level === "L1") progress = 25
// if(p.level === "L2") progress = 50
// if(p.level === "L3") progress = 75
// if(p.level === "L4") progress = 100

// let progressBar = `
// <div class="progress">
// <div class="progress-bar" style="width:${progress}%"></div>
// </div>
// `

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
${role !== "viewer" ? `<button onclick="editProject(${p.id})">Edit</button>` : ""}
</td>

<td>
${role === "admin" ? `<button onclick="deleteProject(${p.id})">Delete</button>` : ""}
</td>

`

tbody.appendChild(row)

})

}


// const progressBar = `
// <div style="width:120px;background:#e5e7eb;border-radius:10px;height:8px;">
//   <div style="width:${progress}%;background:#0ea5e9;height:8px;border-radius:10px;"></div>
// </div>
// `;
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

// if(role !== "admin"){
// alert("Only admin can add projects")
// return
// }
if(role === "admin"){
document.getElementById("addProjectBtn").style.display = "inline-block"
}else{
document.getElementById("addProjectBtn").style.display = "none"
}

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
const type = document.getElementById("f_type").value
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
// const drive_link = document.getElementById("f_drive_link").value
//progress: document.getElementById("progress").value
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
// drive_link
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
// drive_link,
updated_at: new Date()
}])

}

await query

window.editingId = null
loadProjects()
closeForm()

}

// SEARCH PROJECT
document.getElementById("search").addEventListener("input", function(){

const value = this.value.toLowerCase()

const rows = document.querySelectorAll("#tableBody tr")

rows.forEach(row => {

const text = row.innerText.toLowerCase()

if(text.includes(value)){
row.style.display = ""
}else{
row.style.display = "none"
}

})

})
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

// START APP
getUserRole()