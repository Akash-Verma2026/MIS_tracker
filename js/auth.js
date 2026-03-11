async function login() {

const email = document.getElementById("email").value
const password = document.getElementById("password").value

const { data, error } = await supabaseClient.auth.signInWithPassword({
  email: email,
  password: password
})

if (error) {
  alert(error.message)
  return
}

window.location = "dashboard.html"

}

document.getElementById("loginBtn").addEventListener("click", login)