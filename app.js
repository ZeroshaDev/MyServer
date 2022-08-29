const http = require("http");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://0.0.0.0:27017";
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

http
  .createServer(async function (request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Request-Method", "*");
    response.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
    response.setHeader("Access-Control-Allow-Headers", "*");
    if (request.url === "/getposts") {
      let data;
      mongoClient.connect(function (err, client) {
        const db = client.db("todoshnik");
        const collection = db.collection("posts");
        if (err) {
          return console.log(err);
        }
        collection.find().toArray(function (err, results) {
          console.log(results);
          data = JSON.stringify(results);
          client.close();
          response.end(data);
          console.log(typeof data);
        });
      });
    }
    if (request.url === "/addpost") {
      const buffers = [];

      for await (const chunk of request) {
        buffers.push(chunk);
      }

      const data = JSON.parse(Buffer.concat(buffers).toString());
      console.log(data);
      mongoClient.connect(function (err, client) {
        if (err) {
          console.log("Connection error: ", err);
          throw err;
        }
        const db = client.db("todoshnik");
        const collection = db.collection("posts");
        collection.insertOne(data, function (err, result) {
          if (err) {
            return console.log(err);
          }
          console.log(result);
          client.close();
        });
      });
      response.end("Запись добавлена в БД");
    }
    if (request.url === "/deletepost") {
      const buffers = [];

      for await (const chunk of request) {
        buffers.push(chunk);
      }

      const data = JSON.parse(Buffer.concat(buffers).toString());
      console.log("deleting");
      mongoClient.connect(function (err, client) {
        const db = client.db("todoshnik");
        const collection = db.collection("posts");
        if (err) {
          return console.log(err);
        }
        collection.deleteOne(
          { id: data.id },
          function (err, result) {
            console.log(result);
            client.close();
          }
        );
      });
    }
    if (request.url === "/editpost") {
      console.log("edited");
      const buffers = [];

      for await (const chunk of request) {
        buffers.push(chunk);
      }

      const data = JSON.parse(Buffer.concat(buffers).toString());
      console.log(data);
      mongoClient.connect(function (err, client) {
        const db = client.db("todoshnik");
        const collection = db.collection("posts");
        if (err) {
          return console.log(err);
        }
        collection.updateOne(
          { id: data.id },
          {
            $set: {
              id: data.id,
              content: data.content,
              completed: data.completed,
            },
          },
          function (err, result) {
            console.log(result);
            client.close();
          }
        );
      });
    }
  })
  .listen(3000, () =>
    console.log("Сервер запущен по адресу http://localhost:3000")
  );
