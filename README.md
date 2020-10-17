# urlShortener
Basic backend url shortener
## Usage 
By default, monk tries to connect to 127.0.0.1:7777/mongoTesting, modify it to your MongoDb url.

The connection with the API is done by sending a POST with a json with the fields "shortId" and "url".

If the response is successful, then you can access the web using 127.0.0.1:4000/your_shortID.
