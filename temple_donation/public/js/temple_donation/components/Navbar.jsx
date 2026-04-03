import React from "react";

const Navbar = () => {
  const handleNav = (route) => {
    if (typeof frappe !== "undefined" && frappe.set_route) {
        frappe.set_route("aavatto-test", route);
    }
  };

  return (
    <div style={styles.navbar}>
      <h3 className="test" style={styles.logo}>Aavatto App</h3>

      <div style={styles.links}>
        <button onClick={() => handleNav("")} style={styles.link}>Dashboard</button>
        <button onClick={() => handleNav("customers")} style={styles.link}>Customers</button>
        <button onClick={() => handleNav("orders")} style={styles.link}>Orders</button>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#171717",
    color: "#fff"
  },
  logo: {
    margin: 0
  },
  links: {
    display: "flex",
    gap: "20px"
  },
  link: {
    color: "#fff",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    fontSize: "16px",
    textDecoration: "none",
    fontWeight: "500"
  }
};

export default Navbar;