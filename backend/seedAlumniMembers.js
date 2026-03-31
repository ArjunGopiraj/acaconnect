require("dotenv").config();
const connectDB = require("./src/config/db");
const Alumni = require("./src/models/Alumni");
const User = require("./src/models/User");

const seedAlumniMembers = async () => {
  try {
    await connectDB();

    const alumniUser = await User.findOne({ email: "alumni@test.com" });
    if (!alumniUser) {
      console.error("❌ Alumni user not found. Run addAlumniUser.js first.");
      process.exit(1);
    }

    const members = [
      { name: "Aravind Kumar S", contact: "9876543210", email: "aravind.kumar@gmail.com", linkedin: "linkedin.com/in/aravindkumar", batch: "2018–2021", location: "Chennai", organization: "TCS", position: "Software Engineer" },
      { name: "Priya Nair", contact: "9123456780", email: "priyanair@gmail.com", linkedin: "linkedin.com/in/priyanair", batch: "2017–2020", location: "Bangalore", organization: "Infosys", position: "Senior Developer" },
      { name: "Vignesh R", contact: "9001234567", email: "vignesh.r@gmail.com", linkedin: "linkedin.com/in/vigneshr", batch: "2019–2022", location: "Chennai", organization: "Zoho", position: "Software Developer" },
      { name: "Anjali Menon", contact: "9871234560", email: "anjali.menon@gmail.com", linkedin: "linkedin.com/in/anjalimenon", batch: "2016–2019", location: "Kochi", organization: "Wipro", position: "Project Engineer" },
      { name: "Karthik Subramanian", contact: "9012345678", email: "karthik.sub@gmail.com", linkedin: "linkedin.com/in/karthiksub", batch: "2015–2018", location: "Chennai", organization: "Cognizant", position: "Tech Lead" },
      { name: "Divya S", contact: "9898765432", email: "divya.s@gmail.com", linkedin: "linkedin.com/in/divyas", batch: "2018–2021", location: "Hyderabad", organization: "Accenture", position: "Associate Software Engineer" },
      { name: "Rahul Krishnan", contact: "9789012345", email: "rahul.krish@gmail.com", linkedin: "linkedin.com/in/rahulkrish", batch: "2017–2020", location: "Bangalore", organization: "Capgemini", position: "Consultant" },
      { name: "Sneha Joseph", contact: "9123098765", email: "sneha.joseph@gmail.com", linkedin: "linkedin.com/in/snehajoseph", batch: "2019–2022", location: "Chennai", organization: "HCL", position: "Software Engineer" },
      { name: "Suresh Babu", contact: "9345678901", email: "suresh.babu@gmail.com", linkedin: "linkedin.com/in/sureshbabu", batch: "2014–2017", location: "Coimbatore", organization: "IBM", position: "System Engineer" },
      { name: "Meera Krishnan", contact: "9567890123", email: "meera.krish@gmail.com", linkedin: "linkedin.com/in/meerakrish", batch: "2016–2019", location: "Chennai", organization: "Zoho", position: "UI Developer" },
      { name: "Ajay Prakash", contact: "9786543210", email: "ajay.prakash@gmail.com", linkedin: "linkedin.com/in/ajayprakash", batch: "2015–2018", location: "Pune", organization: "Tech Mahindra", position: "Software Engineer" },
      { name: "Lakshmi R", contact: "9874561230", email: "lakshmi.r@gmail.com", linkedin: "linkedin.com/in/lakshmir", batch: "2018–2021", location: "Chennai", organization: "Freshworks", position: "Product Analyst" },
      { name: "Naveen Kumar", contact: "9012987654", email: "naveen.kumar@gmail.com", linkedin: "linkedin.com/in/naveenkumar", batch: "2017–2020", location: "Bangalore", organization: "Amazon", position: "SDE" },
      { name: "Harini V", contact: "9345612789", email: "harini.v@gmail.com", linkedin: "linkedin.com/in/hariniv", batch: "2019–2022", location: "Chennai", organization: "PayPal", position: "Software Engineer" },
      { name: "Mohammed Irfan", contact: "9873216540", email: "irfan.m@gmail.com", linkedin: "linkedin.com/in/irfanm", batch: "2016–2019", location: "Chennai", organization: "TCS", position: "Developer" }
    ];

    let added = 0;
    for (const m of members) {
      const exists = await Alumni.findOne({ email: m.email });
      if (!exists) {
        await Alumni.create({ ...m, added_by: alumniUser._id });
        added++;
        console.log(`✅ Added: ${m.name}`);
      } else {
        console.log(`⏭️  Already exists: ${m.name}`);
      }
    }

    console.log(`\nDone! ${added} new members added.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed:", error);
    process.exit(1);
  }
};

seedAlumniMembers();
