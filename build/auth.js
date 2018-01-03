function onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    const id_token = googleUser.getAuthResponse().id_token;
    const init = {
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        })
    }
    const query = '?idtoken=' + id_token;
    const url = 'https://nocturnal-0220.herokuapp.com/verify';

    fetch(url + query, init)
    .then(res => {
        if (res.ok) console.log('token verified');
        const input = document.getElementById('auth')
        input.onchange();
    })
    .catch(e => console.log(e));
}
