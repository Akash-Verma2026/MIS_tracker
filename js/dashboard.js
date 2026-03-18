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
let hold = 0

data.forEach(p => {

let category = (p.category || "").toLowerCase()

if(category.includes("customer")) customer++
if(category.includes("r&d")) rd++
if(category.includes("hold")) hold++

})

document.getElementById("customerProjects").innerText = customer
document.getElementById("rdProjects").innerText = rd
document.getElementById("holdProjects").innerText = hold
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
    if (filters.category === "Customer") {
      filteredData = filteredData.filter(p =>
        (p.category || "").toLowerCase().includes("customer")
      )
    }

    if (filters.category === "R&D") {
      filteredData = filteredData.filter(p =>
        (p.category || "").toLowerCase().includes("r&d")
      )
    }

    if (filters.category === "On Hold") {
      filteredData = filteredData.filter(p =>
        (p.category || "").toLowerCase().includes("hold")
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

// START APP
getUserRole()