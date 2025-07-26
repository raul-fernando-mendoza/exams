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
        const siteKeyValid= '6LcV24krAAAAANUPjBJ4tGKQ16C06auSvpQp_Rkq'

        siteKey = req.body.siteKey || req.query.siteKey 
        response = req.body.response || req.query.response

        console.log("***********siteKey:" + siteKey)
        console.log("***********response:" + response)

        res.set({
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin':'*'
        })        

        if( siteKeyValid == siteKey ){
            console.log("***********calling captcha")
            const url = 'https://www.google.com/recaptcha/api/siteverify'
            const data = {
            "secret" : "6LcV24krAAAAAIfYMIhxasBoniJ18UNWJO_m6Qxz",
            "response": response
            };
            const customHeaders = {
                "Content-Type": 'application/x-www-form-urlencoded'
            }
            
            fetch(url, {
                method: "POST",
                headers: customHeaders,
                body: `secret=${data.secret}&response=${data.response}`
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    res.send(data);
                });
        }
        else{
            res.send({"error":"invalid siteKey"});
        }


    //  let message = req.query.message || req.body.message || 'Hello World!';
    //  res.status(200).send(message);
    }
};
