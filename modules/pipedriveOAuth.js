const PIPEDRIVE_CLIENT_ID = process.env.PIPEDRIVE_CLIENT_ID;
const PIPEDRIVE_CLIENT_SECRET = process.env.PIPEDRIVE_CLIENT_SECRET;
const PIPEDRIVE_CALLBACK_URI = process.env.PIPEDRIVE_CALLBACK_URI;
const PIPEDRIVE_CREDENTIALS_64 = Buffer.from(`${PIPEDRIVE_CLIENT_ID}:${PIPEDRIVE_CLIENT_SECRET}`).toString('base64')



const getPipedriveTokens = async (code) => {

    const response = await fetch ('https://oauth.pipedrive.com/oauth/token',{
        method: 'POST',
        headers: {'Content-type' : 'application/x-www-form-urlencoded',
                    'Authorization' : `Basic ${PIPEDRIVE_CREDENTIALS_64}`
        },
        body: new URLSearchParams({
            grant_type : 'authorization_code',
            redirect_uri : PIPEDRIVE_CALLBACK_URI,
            code : code
  }) 
});
        return response.json()
};


const refreshPipedriveToken = async (refreshToken) => {

        const response = await fetch ('https://oauth.pipedrive.com/oauth/token',{
            method: 'POST',
            headers: {'Content-type' : 'application/x-www-form-urlencoded',
                        'Authorization' : `Basic ${PIPEDRIVE_CREDENTIALS_64}}`
            },
            body: new URLSearchParams({
                grant_type : 'refresh_token',
                refresh_token : refreshToken,
      }) 
    });
            return response.json()
    };

const getPipedriveProfile = async (domain, accessToken) => {
    
  const response = await  fetch(`${domain}/v1/users/me`,{
        headers:{ 'Authorization': `Bearer ${accessToken}`}
      })
        const data = await response.json()

      return data.data
}


module.exports = { getPipedriveTokens , refreshPipedriveToken, getPipedriveProfile }