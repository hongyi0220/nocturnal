function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    // console.log(profile);
    const id_token = googleUser.getAuthResponse().id_token;
    const init = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    }
    const query = '?idtoken=' + id_token;
    const url = 'http://localhost:8080/verify';
    // console.log('idtoken:', id_token);
    fetch(url + query, init)
    .then(res => {
        if (res.ok) console.log('token verified');
    })
    .catch(e => console.log(e))
}
