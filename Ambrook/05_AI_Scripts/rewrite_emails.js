const fs = require('fs');
const path = require('path');

const industries = [
  "Farming - Other/Unknown",
  "Ranching - Other / Unknown",
  "Farming - Row Crops",
  "Trucking",
  "Equestrian - Training",
  "Ranching - Cow/Calf",
  "Construction",
  "Equestrian - Other",
  "Agriculture Services"
];

const emailContents = JSON.parse(fs.readFileSync(path.join(__dirname, 'email_contents.json'), 'utf8'));

const generateRewrite = (email, industry) => {
  let industrySpecificTerm = industry.split(' - ')[0].toLowerCase();
  if (industrySpecificTerm === 'ranching') industrySpecificTerm = 'ranch';
  if (industrySpecificTerm === 'farming') industrySpecificTerm = 'farm';
  
  let subject = email.subject;
  let previewText = email.previewText;
  let body = email.body;
  let ctaText = email.ctaText;

  // Generic adjustments based on industry
  if (industry.includes('Farming')) {
    body = body.replace(/farms, ranches, and growing businesses/g, 'farms and crop operations');
    body = body.replace(/people who grow things/g, 'producers like you');
  } else if (industry.includes('Ranching')) {
    body = body.replace(/farms, ranches, and growing businesses/g, 'ranches and livestock operations');
    body = body.replace(/people who grow things/g, 'ranchers who know the land');
  } else if (industry.includes('Trucking')) {
    subject = subject.replace(/Ambrook/g, 'Ambrook for Trucking');
    previewText = "We build accounting tools for the long haul.";
    body = body.replace(/farms, ranches, and growing businesses/g, 'trucking fleets and owner-operators');
    body = body.replace(/people who grow things/g, 'people who keep things moving');
    body = body.replace(/Cattle vs. crops. Field A vs. Field B./g, 'Load A vs. Load B. Fuel costs vs. maintenance.');
  } else if (industry.includes('Equestrian')) {
    body = body.replace(/farms, ranches, and growing businesses/g, 'equestrian facilities and trainers');
    body = body.replace(/people who grow things/g, 'horsemen and equestrian professionals');
    body = body.replace(/Cattle vs. crops. Field A vs. Field B./g, 'Boarding vs. training. Lesson income vs. clinic fees.');
  } else if (industry.includes('Construction')) {
    body = body.replace(/farms, ranches, and growing businesses/g, 'construction firms and contractors');
    body = body.replace(/people who grow things/g, 'people who build the future');
    body = body.replace(/Cattle vs. crops. Field A vs. Field B./g, 'Project A vs. Project B. Material costs vs. labor.');
  } else if (industry.includes('Agriculture Services')) {
    body = body.replace(/farms, ranches, and growing businesses/g, 'ag service providers and consultants');
    body = body.replace(/people who grow things/g, 'the people who support our producers');
  }

  // Specific Cow/Calf adjustments
  if (industry === "Ranching - Cow/Calf") {
    body = body.replace(/Cattle vs. crops. Field A vs. Field B./g, 'Cow-calf pairs vs. yearlings. Pasture A vs. Pasture B.');
  }

  // Specific Row Crops adjustments
  if (industry === "Farming - Row Crops") {
    body = body.replace(/Cattle vs. crops. Field A vs. Field B./g, 'Corn vs. Soybeans. Field A vs. Field B.');
  }

  return `
### Industry: ${industry}

**Subject:** ${subject}
**Preview Text:** ${previewText}

**Body:**
${body}

**CTA:** [${ctaText}](${email.ctaLink})

---
`;
};

emailContents.forEach(email => {
  const fileName = `email_${email.id}.md`;
  const filePath = path.join(__dirname, '..', fileName);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content += `
## Industry-Specific Rewrites
`;
  
  industries.forEach(industry => {
    content += generateRewrite(email, industry);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${fileName} with industry rewrites.`);
});
