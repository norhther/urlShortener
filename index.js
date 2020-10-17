const express = require("express");
const monk = require("monk")
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const yup = require("yup");

const app = express();

//middlewares
app.use(cors());
app.use(helmet())
app.use(morgan("tiny"));
app.use(express.json());

const port = 4000

const dbUrl = "127.0.0.1:7777/mongoTesting";
const db = monk(dbUrl).get("urls");

db.createIndex({ shortId: 1 }, { unique: true });


//validation schemas for url
const schema = yup.object().shape({
    shortId: yup.string().trim().matches(/^[\w\-]+$/i).required(),
    url: yup.string().trim().url().required(),
});


app.get("/", (req,res) => {
    res.send("Send a post req to /url with {shortId : shortWord, url : url) :D");
})

app.get('/:id', async (req, res, next) => {
    const {id : shortId} = req.params;
    try {
      const dbRes = await db.findOne({shortId});
      if (dbRes) {
        return res.redirect(dbRes.url);
      } 
      res.redirect("/?error=query not found");
    } 
    catch (error) {
      next(error);
    }
  });

app.post("/url", async (req, res, next) => {
    let {shortId, url} = req.body;
    try {
        await schema.validate({
            shortId,
            url
        });

        const exists = await db.findOne({shortId});
        if (exists) {
            throw new Error("The shortId exists in the db");
        }

        shortId = shortId.toLowerCase();
        const newUrl = {
            shortId,
            url
        };
        const created = await db.insert(newUrl);
        created.success = true;
        res.json(created);
    }

    catch (error) {
        next(error);
    }

});


//Error handler
app.use((error,req,res,next) => {
    if (error.status) {
        res.status = error.status;
    }
    else {
        res.status = 500;
    }

    res.json({
        message: error.message,
        stack: error.stack
    })
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

