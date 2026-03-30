

const ipt_email    = document.getElementById("email");
const ipt_password = document.getElementById("password");
const bt_connexion = document.getElementById("connexion");

bt_connexion.onclick = async () =>
{
    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            email: ipt_email.value, 
            password: ipt_password.value
        }),
        credentials: "include"
    });

    if (!res.ok)
    {
        const text = await res.text();
        console.error(`HTTP ${res.status}: ${text}`);
        return ;
    }

    console.log("connected !");
    // document.location.href = "/connect.html";
}
        