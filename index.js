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

// Common filtering logic
const filterData = (req, _res, next) => {
  const { startingDate, endDate, state } = req.body;
  req.filteredData = req.data.usersData.filter((row) => {
    const fromDate = new Date(startingDate);
    const toDate = new Date(endDate);
    const orderDate = new Date(row["OrderDate"]);
    return row.State === state && orderDate <= toDate && orderDate >= fromDate;
  });
  next();
};

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

app.post("/summary", filterData, (req, res) => {
  const data = req.filteredData.reduce(
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

app.post("/SalesByCity", filterData, (req, res) => {
  const salesByCity = req.filteredData.reduce((acc, row) => {
    const city = row.City;
    const sales = row.Sales;

    acc[city] = (acc[city] || 0) + sales;

    return acc;
  }, {});

  const result = Object.entries(salesByCity)
    .map(([label, value]) => ({
      label,
      value: Math.round(value),
    }))
    .slice(0, 7);
  return res.status(200).json(result);
});

app.post("/SalesByProducts", filterData, (req, res) => {
  const salesByProduct = req.filteredData.reduce((acc, row) => {
    const productName = row.ProductName;
    const sales = row.Sales;

    acc[productName] = (acc[productName] || 0) + sales;

    return acc;
  }, {});

  const result = Object.entries(salesByProduct).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
  return res.status(200).json(result);
});

app.post("/SalesByCategory", filterData, (req, res) => {
  const salesByCategory = req.filteredData.reduce((acc, row) => {
    const category = row.Category;
    const sales = row.Sales;

    acc[category] = (acc[category] || 0) + sales;
    return acc;
  }, {});

  const result = Object.entries(salesByCategory).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
  return res.status(200).json(result);
});

app.post("/SalesBySubCategory", filterData, (req, res) => {
  const salesBySubCategory = req.filteredData.reduce((acc, row) => {
    const subCategory = row.SubCategory;
    const sales = row.Sales;

    acc[subCategory] = (acc[subCategory] || 0) + sales;
    return acc;
  }, {});

  const result = Object.entries(salesBySubCategory).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
  return res.status(200).json(result);
});

app.post("/SalesBySegment", filterData, (req, res) => {
  const salesBySegment = req.filteredData.reduce((acc, row) => {
    const Segment = row.Segment;
    const sales = row.Sales;

    acc[Segment] = (acc[Segment] || 0) + sales;
    return acc;
  }, {});

  const result = Object.entries(salesBySegment).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
  return res.status(200).json(result);
});

app.listen(port, () => {
  console.log("Listining ", port);
});
