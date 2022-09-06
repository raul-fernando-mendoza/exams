import logging
from google.cloud import firestore
from google.cloud import storage
from firebase_admin import auth
import firebase_admin

import stripe
# This is your test secret API key.
stripe.api_key = 'sk_test_51KsBwvFedVXPScZdagNGx4yyUG78hbm59xuNfsN0LIerSQG24jlqTrgg4bIsRcrYH7Ra2SVB5Q57T9FBz5RaLWg600syPK0Zfk'


firebase_admin.initialize_app()

logging.basicConfig(format='**** -- %(asctime)-15s %(message)s', level=logging.DEBUG)

log = logging.getLogger("exams")
log.setLevel(logging.DEBUG)

def createPaymentIntendPost(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    data = None
    try:
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")


        product_id = obj["product_id"]
        metadata = obj["metadata"]
        
        data = create_payment(product_id, metadata)
    
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)

def create_payment(product_id, metadata):
    # Create a PaymentIntent with the order amount and currency
    payment_amount = getProductDefaultPrice(product_id)
    intent = stripe.PaymentIntent.create(
        amount=payment_amount,
        currency='mxn',
        automatic_payment_methods={
            'enabled': True,
        },
        metadata=metadata
    )
    return ({
        'id': intent['id'],
        'clientSecret': intent['client_secret'],
        'amount':intent['amount'],
        'metadata': intent['metadata']
    })

#********************************************
def getProductDefaultPricePost(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    data = None
    try:
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")


        product_id = obj["product_id"]
        default_price = getProductDefaultPrice(product_id)
        product_name = getProductName(product_id)

        data = {"product_id":product_id, "product_name":product_name, "default_price":default_price}
    
    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)

def list_products():
    result = []
    priceObjects = stripe.Product.list(limit=3)
    for product in priceObjects.data:
        price_id = product.default_price
        prices = stripe.Price.retrieve(price_id)
        result.append( { "id":product.id, "name": product.name, "price": prices.unit_amount} )
    return result    

def getProductDefaultPrice(productId):
    product = stripe.Product.retrieve(productId)
    price_id = product.default_price
    price = stripe.Price.retrieve(price_id)
    return price.unit_amount        
    
def getProductName(productId):
    product = stripe.Product.retrieve(productId)  
    return product.name  


#********************************************
def getPaymentIntentPost(request):
    log.error("**** create certificates receive:" + str(request))
    log.error("**** create certificates type:" + str(type(request)))
    log.error("**** create certificates method:" + str(request.method))
    log.error("**** create certificates content-type:" + str(request.content_type))
    log.error("**** create certificates mimetype:" + str(request.mimetype))    
    log.error("**** create certificates is_json:" + str(request.is_json))      
    log.error("**** create certificates get content_encoding:" + str(request.content_encoding))    
    log.error("**** create certificates get data:" + str(type(request.get_data())))
    log.error("**** create certificates decode:" + str(request.get_data().decode()))

    # For more information about CORS and CORS preflight requests, see:
    # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request

    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }

        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    data = None
    try:
        obj = request.get_json(force=True, silent=False)
        if obj == None:
            log.error("***** request can not be read as json")
            raise Exception("json cannot be read")
        else:
            log.error("***** request was read as json")


        paymentIntentId = obj["paymentIntentId"]
        data = getPaymentIntent(paymentIntentId)

    except Exception as e:
        log.error("**** processRequest Exception:" + str(e))
        return ({"error":str(e)}, 200, headers)
    return ({"result":data}, 200, headers)

def getPaymentIntent(paymentIntentId):
    paymentIntent = stripe.PaymentIntent.retrieve(paymentIntentId)
    return {
        "id":paymentIntent['id'],
        "amount":paymentIntent["amount"],
        "metadata":paymentIntent["metadata"]
    }       
    
 
