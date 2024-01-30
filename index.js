const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const port = 4200;

const express = require("express");
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  fs.readFile("sales.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file: ", err);
      res.status(500).send("Internal server Error");
      return;
    }

    try {
      req.data = JSON.parse(data);
      next();
    } catch (error) {
      console.error("Error parsing JSOn: ", error);
      res.status(500).send("Internal server Error");
    }
  });
});

app.get("/usersData", (req, res) => {
  const salesData = req.data && req.data.usersData ? req.data.usersData : [];
  res.json(salesData);
});

app.get("/usersData/:id", (req, res) => {
  const userId = req.params.id;
  const user = req.data.usersData.find((u) => u["OrderID"] === userId);

  user
    ? res.status(200).json(user)
    : res.status(404).json({ error: "user is not available" });
});

app.get("/states", (req, res) => {
  const dataByState = req.data.usersData.map((row) => {
    return row.State;
  });
  const uniq = [...new Set(dataByState)];

  uniq.sort();
  uniq
    ? res.status(200).json(uniq)
    : res.status(404).json({ error: "State is not available" });
});

app.post("/summary", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData
    .filter((row) => {
      const fromDate = new Date(startingDate);
      const todate = new Date(endDate);
      const orderDate = new Date(row["OrderDate"]);
      return (
        row.State === state && orderDate <= todate && orderDate >= fromDate
      );
    })
    .reduce(
      (acc, row) => {
        return {
          totalSales: Math.round(acc.totalSales + row.Sales),
          quantitySold: acc.quantitySold + row.Quantity,
          discount: acc.discount + row.Discount,
          profit: Math.round(acc.profit + row.Profit),
          saleCount: acc.saleCount + 1,
        };
      },
      { totalSales: 0, profit: 0, quantitySold: 0, discount: 0, saleCount: 0 }
    );
  if (data.saleCount > 0) {
    data.discount = Math.round((data.discount / data.saleCount) * 10000) / 100;
  }
  return res.status(200).json(data);
});

app.post("/SalesByCity", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const todate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= todate && orderDate >= fromDate;
  });

  const salesByCity = {};

  data.forEach((row) => {
    const city = row.City;
    const sales = row.Sales;

    if (salesByCity[city]) {
      salesByCity[city] += sales;
    } else {
      salesByCity[city] = sales;
    }
  });
  const result = Object.keys(salesByCity)
    .map((label) => ({
      label,
      value: Math.round(salesByCity[label]),
    }))
    .slice(0, 7);
  return res.status(200).json(result);
});

app.post("/SalesByProducts", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const todate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= todate && orderDate >= fromDate;
  });

  const salesByProduct = {};

  data.forEach((row) => {
    const productName = row.ProductName;
    const sales = row.Sales;

    if (salesByProduct[productName]) {
      salesByProduct[productName] += sales;
    } else {
      salesByProduct[productName] = sales;
    }
  });
  const result = Object.keys(salesByProduct).map((label) => ({
    label,
    value: Math.round(salesByProduct[label]),
  }));
  return res.status(200).json(result);
});

app.post("/SalesByCategory", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const todate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= todate && orderDate >= fromDate;
  });

  const salesByCategory = {};

  data.forEach((row) => {
    const category = row.Category;
    const sales = row.Sales;

    if (salesByCategory[category]) {
      salesByCategory[category] += sales;
    } else {
      salesByCategory[category] = sales;
    }
  });
  const result = Object.keys(salesByCategory).map((label) => ({
    label,
    value: Math.round(salesByCategory[label]),
  }));
  return res.status(200).json(result);
});

app.post("/SalesBySubCategory", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const todate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= todate && orderDate >= fromDate;
  });

  const salesBySubCategory = {};

  data.forEach((row) => {
    const subCategory = row.SubCategory;
    const sales = row.Sales;

    if (salesBySubCategory[subCategory]) {
      salesBySubCategory[subCategory] += sales;
    } else {
      salesBySubCategory[subCategory] = sales;
    }
  });
  const result = Object.keys(salesBySubCategory).map((label) => ({
    label,
    value: Math.round(salesBySubCategory[label]),
  }));
  return res.status(200).json(result);
});

app.post("/SalesBySegment", (req, res) => {
  const { startingDate, endDate, state } = req.body;
  const data = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const todate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= todate && orderDate >= fromDate;
  });

  const salesBySegment = {};

  data.forEach((row) => {
    const Segment = row.Segment;
    const sales = row.Sales;

    if (salesBySegment[Segment]) {
      salesBySegment[Segment] += sales;
    } else {
      salesBySegment[Segment] = sales;
    }
  });
  const result = Object.keys(salesBySegment).map((label) => ({
    label,
    value: Math.round(salesBySegment[label]),
  }));
  return res.status(200).json(result);
});

app.listen(port, () => {
  console.log("Listining ", port);
});
