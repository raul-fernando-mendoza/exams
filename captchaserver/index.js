const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');
const VALID_SITE_KEY= '6LcV24krAAAAANUPjBJ4tGKQ16C06auSvpQp_Rkq'
const PROJECT_ID= "thoth-dev-346022"

async function createAssessment({
   projectID = "your-project-id",
   recaptchaKey = "your-recaptcha-key",
   token = "action-token",
   recaptchaAction = "action-name",
   userIpAddress = "user-ip-address",
   userAgent = "user-agent",
   ja4 = "ja4",
   ja3 = "ja3"
 }) {
   // Create the reCAPTCHA client & set the project path. There are multiple
   // ways to authenticate your client. For more information see:
   // https://cloud.google.com/docs/authentication
   // TODO: To avoid memory issues, move this client generation outside
   // of this example, and cache it (recommended) or call client.close()
   // before exiting this method.
   const client = new RecaptchaEnterpriseServiceClient();
   const projectPath = client.projectPath(projectID);

   // Build the assessment request.
   const request = ({
     assessment: {
       event: {
         token: token,
         siteKey: recaptchaKey,
         userIpAddress: userIpAddress,
         userAgent: userAgent,
         ja4: ja4,
         ja3: ja3,
       },
     },
     parent: projectPath,
   });

   // client.createAssessment() can return a Promise or take a Callback
   const [ response ] = await client.createAssessment(request);
   console.log( "response:" , response )

   // Check if the token is valid.
   if (!response.tokenProperties.valid) {
    console.log("The CreateAssessment call failed because the token was: " +
      response.tokenProperties.invalidReason);

    return null;
   }

   // Check if the expected action was executed.
   // The `action` property is set by user client in the
   // grecaptcha.enterprise.execute() method.
   if (response.tokenProperties.action === recaptchaAction) {

    // Get the risk score and the reason(s).
    // For more information on interpreting the assessment,
    // see: https://cloud.google.com/recaptcha/docs/interpret-assessment
    console.log("The reCAPTCHA score is: " +
      response.riskAnalysis.score);

    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });
    return response.riskAnalysis.score;
   } else {
    console.log("The action attribute in your reCAPTCHA tag " +
      "does not match the action you are expecting to score");
    return null;
   }
 }



/**
 * use first gen 
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
 exports.captchaserver = (req, res) => {

    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE,GET,PATCH,POST,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    });

    // intercept OPTIONS method
    if(req.method === 'OPTIONS') {
        console.log("***********console options")
        res.send(200);
    }    
    else{
        action = req.body.action || req.query.action
        token = req.body.token || req.query.token
        siteKey = req.body.siteKey || req.query.siteKey

        console.log("***********siteKey:" + siteKey)
        console.log("***********action:" + action)

        res.set({
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin':'*'
        })        

        if( VALID_SITE_KEY == siteKey ){
            const url = 'https://www.google.com/recaptcha/api/siteverify'
            const data = {
            projectID:PROJECT_ID,
            recaptchaKey:siteKey,
            token:token,
            recaptchaAction:action,
            userIpAddress:req.ip,
            userAgent:req.headers['user-agent'],
            ja4:"ja4",
            ja3:"ja3"        
            };
            const customHeaders = {
                "Content-Type": 'application/x-www-form-urlencoded'
            }
            
            createAssessment( data ).then( result =>{
            console.log( "result:", result)
            res.send({"score":result});
            })
        }
        else{
            res.send({"error":"invalid siteKey"});
        }
    }
};
