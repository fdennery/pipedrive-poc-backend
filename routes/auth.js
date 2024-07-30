var express = require('express');
var router = express.Router();
const User = require('../models/users');
const { getPipedriveTokens, refreshPipedriveToken, getPipedriveProfile } = require('../modules/pipedriveOAuth');
const { getGoogleTokens, refreshGoogleToken, getGoogleProfile} = require('../modules/googleOAuth');
const crypto = require('crypto');
const {jwtDecode} = require('jwt-decode')



// Get Session

router.get('/session', (req, res) => {
    res.json({sessionID : req.session.id , session: req.session});
  });



// PIPEDRVE OAUTH

const PIPEDRIVE_CLIENT_ID = process.env.PIPEDRIVE_CLIENT_ID;
const PIPEDRIVE_CALLBACK_URI = process.env.PIPEDRIVE_CALLBACK_URI

// Authorize pipedrive

router.get('/pipedrive', (req, res)=>{
    res.redirect(`https://oauth.pipedrive.com/oauth/authorize?client_id=${PIPEDRIVE_CLIENT_ID}&redirect_uri=${PIPEDRIVE_CALLBACK_URI}`)
})


// Callback pipedrive

router.get ('/pipedrive/callback', async (req, res ) => {
    const code = req.query.code
    try {
        const tokens = await getPipedriveTokens(code) // recupération l'acess token
        const profile = await getPipedriveProfile(tokens.api_domain, tokens.access_token) // récupération du profil

        let user = await User.findOne({pipedrive_user_id : `${profile.company_id}-${profile.id}`}) // vérification si user existe et création si n'existe pas
        if (!user) {
            user = new User({
                pipedrive_user_id:`${profile.company_id}-${profile.id}`,
                pipedrive_refresh_token: tokens.refresh_token,
                google_user_id :null,
                google_refresh_token: null})
            await user.save();

        }   // Enregistrement infos dans session
        
            req.session.pipedriveUserID =`${profile.company_id}-${profile.id}`;
            req.session.pipedriveAccessToken = tokens.access_token;
            req.session.pipedriveTokenExpirationDate = Date.now() + tokens.expires_in * 1000;
            req.session.pipedriveRefreshToken = tokens.refresh_token;
            req.session.apiDomain = tokens.api_domain;
          
   
        res.redirect('http://localhost:3001/home') // redirection frontend

    } catch (err) {
        console.log(err);
        res.status(500).json({result: false, error: 'Sever Error'})
    }
}); 


router.get ('/pipedrive/user', async (req, res) => {
    if (req.session.pipedriveUserID) {
        try {
            const profile = await getPipedriveProfile(req.session.apiDomain, req.session.pipedriveAccessToken);
            res.json({result : true, message: 'Authenticated', user: profile })
        } catch (err) {
            console.log(err)
                if (err.response && err.response.status === 401) {
                // Si 401, tentative rafraichissement
                    try   { 
                        const tokens = await refreshPipedriveToken(req.session.pipedriveRefreshToken)
                        req.session.pipedriveUserID =`${profile.company_id}-${profile.id}`;
                        req.sessopn.pidedriveUsername = profile.name
                        req.sessopn.pidedriveCompany = profile.company_name
                        req.session.pipedriveAccessToken = tokens.access_token;
                        req.session.pipedriveTokenExpirationDate = Date.now() + tokens.expires_in * 1000;
                        req.session.pipedriveRefreshToken = tokens.refresh_token;
                        req.session.apiDomain = tokens.api_domain;
                        const profile = await getPipedriveProfile(req.session.apiDomain, req.session.pipedriveAccessToken);
                        res.json({result : true, user : profile.data, message: 'Token refreshed'})
                    }
                        catch (refreshError) {
                        res.status(401).json({result: false, error: 'Failed Refresh Token'})
                }
                 } else {
                    console.log('')
                    res.status(500).json({result: false, error : 'Server error'})
            }
        }
        } else { 
            res.status(401).json({result:false,  message: 'Not authenticated' });
        }
});


// GOOGLE OAUTH 

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CALLBACK_URI = process.env.GOOGLE_CALLBACK_URI

// Authorize Google

router.get('/google', (req, res)=>{
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_CALLBACK_URI}&response_type=code&access_type=offline&scope=https://www.googleapis.com/auth/chat.messages https://www.googleapis.com/auth/chat.spaces https://www.googleapis.com/auth/userinfo.email`)
})


// Callback Google

router.get ('/google/callback', async (req, res ) => {
    const code = req.query.code

    try {
        const tokens = await getGoogleTokens(code)
        const profile =  jwtDecode(tokens.id_token)

        req.session.googleIdToken = tokens.id_token
        req.session.googleAcessToken = tokens.access_token
        req.session.googleTokenExpirationDate = Date.now() + tokens.expires_in * 1000;
        req.session.googleRefreshToken = tokens.refresh_token;


     const userGoogle = await User.updateOne(
                        {pipedrive_user_id : req.session.pipedriveUserID},
                        {$set: {
                            google_refresh_token : tokens.refresh_token, 
                            google_user_id: profile.sub
                        }}
        )
        res.redirect('http://localhost:3001/home')
}    catch(err) {
    console.log(err)
    res.status(500).json({result: false, error: 'Sever Error'})

}

        
    
    }
); 


module.exports = router;