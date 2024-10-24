const express = require("express");
const mysql = require("mysql");
const app = express();
const expressPort = 3000;

app.use(express.json());

const dataBase = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "root",
  database: "rest-api",
});

dataBase.connect((err) => {
  if (err) {
    console.log("ERREUR DE CONNEXION !");
  } else {
    console.log("BRAVO, VOUS ETES CONNECTE A LA DATABASE !");
  }
});

app.listen(expressPort, () => {
  console.log("MON SERVEUR TOURNE SUR LE PORT :", expressPort);
});

//Premiere partie pour la base de donnée Rest
app.get("/item", (req, res) => {
  const sql = "SELECT * From item;";

  dataBase.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ERREUR DU SERVEUR" });
    } else {
      return res.status(200).json(result);
    }
  });
});

app.post("/createItem", (req, res) => {
  const { name, price, id_category, description } = req.body;

  const sql =
    "INSERT INTO item (name, price, id_category, description) VALUES (?,?,?,?) ";
  dataBase.query(
    sql,
    [name, price, id_category, description],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "ERREUR DU SERVEUR" });
      } else {
        return res.status(200).json({ message: "ENVOI REUSSI" });
      }
    }
  );
});
// app.post("/createCategory", (req, res) => {
// const { name } = req.body;

// const sql =
// "INSERT INTO category (name) VALUES (?) ";
//  dataBase.query(sql,  [name], (err, result) => {
// if (err) {
// return res.status(500).json({ error: "ERREUR DU SERVEUR" });
// } else {
// return res.status(200).json({ message: "ENVOI REUSSI" });
// }
// });
// });

app.put("/updateItem/:id", (req, res) => {
  const { name, price, id_category, description } = req.body;
  const { id } = req.params;

  const sql =
    "UPDATE  item SET name = ?, price = ?, id_category = ?, description = ? WHERE id = ?";
  dataBase.query(
    sql,
    [name, price, id_category, description, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "ERREUR DU SERVEUR" });
      } else {
        return res.status(200).json({ message: "MODIFICATION REUSSI" });
      }
    }
  );
});
app.delete("/deleteItem/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM item WHERE id = ?";
  dataBase.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ERREUR DU SERVEUR" });
    } else {
      return res.status(200).json({ message: "DONNER SUPPRIMER" });
    }
  });
});

//deuxieme partie pour base de donnée Rest-API code
app.post("/creItem", (req, res) => {
  const { name, price, description, id_category } = req.body;

  const sql = "INSERT INTO item (name, price, description) VALUES (?,?,?) ";

  dataBase.query(sql, [name, price, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ERREUR DU SERVEUR" });
    }

    const itemId = result.insertId;

    const sqlItem_category =
      "INSERT INTO item_category (id_item, id_category) VALUES (?,?)";

    dataBase.query(sqlItem_category, [itemId, id_category], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Erreur  avec la catégorie" });
      } else {
        return res
          .status(200)
          .json({ message: "Item créé " });
      }
    });
  });
});

app.get("/itemsCategory", (req, res) => {
  const sql = `
    SELECT item.name AS item_name, item.price, category.name AS category_name 
    FROM item
    INNER JOIN item_category ON item.id = item_category.id_item
    INNER JOIN category ON item_category.id_category = category.id;
  `;

  dataBase.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur récupération  données" });
    } else {
      return res.status(200).json(result);
    }
  });
});

app.get("/item_Category/:category", (req, res) => {
  const { category } = req.params;
  const sql = `
    SELECT item.name  
    FROM item
    INNER JOIN item_category ON item.id = item_category.id_item
    INNER JOIN category ON item_category.id_category = category.id
    WHERE category.name = ?;
  `;

  dataBase.query(sql, [category], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Erreur lors de la récupération des données" });
    } else {
      if (result.length === 0) {
        return res
          .status(404)
          .json({ message: "Aucun item trouvé pour cette catégorie" });
      }
      return res.status(200).json(result);
    }
  });
});

app.delete("/leteItem/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE item, item_category 
  FROM item INNER 
  JOIN item_category ON item.id = item_category.id_item 
  WHERE item.id = ? `;
  dataBase.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "ERREUR DU SERVEUR" });
    } else {
      return res.status(200).json({ message: "DONNER SUPPRIMER" });
    }
  });
});
