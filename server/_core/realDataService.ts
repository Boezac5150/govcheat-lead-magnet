/**
 * Real Data Service - Generates realistic government contracts
 * Simulates real SAM.gov and FedBizOpps data
 */

export interface RealContract {
  id: string;
  samId: string;
  title: string;
  description: string;
  simplifiedDescription: string;
  agency: string;
  value: number;
  deadline: Date;
  contractType: string;
  simplifiedType: string;
  setAside: string;
  url: string;
  naicsCode: string;
  postedDate: Date;
}

/**
 * Generate realistic government contracts based on real patterns
 */
export function generateRealisticContracts(): RealContract[] {
  const agencies = [
    "Department of Defense",
    "General Services Administration",
    "Department of Veterans Affairs",
    "Department of Interior",
    "Department of Commerce",
    "Department of Labor",
    "Office of Management and Budget",
    "Department of Transportation",
    "Department of Energy",
    "Department of State",
    "Department of Homeland Security",
    "Social Security Administration",
  ];

  const contractTypes = [
    "Firm Fixed Price",
    "Cost Plus Fixed Fee",
    "Time and Materials",
    "Cost Reimbursable",
    "Indefinite Delivery",
  ];

  const setAsides = [
    "Small Business",
    "8(a) Business",
    "HUBZone",
    "Women-Owned",
    "Veteran-Owned",
    "Service-Disabled Veteran",
    "None",
  ];

  const titles = [
    "Software Development and Maintenance",
    "Cloud Infrastructure Services",
    "Cybersecurity Consulting",
    "IT Help Desk Support",
    "Network Infrastructure",
    "Data Analytics Platform",
    "Mobile Application Development",
    "Enterprise Resource Planning",
    "Artificial Intelligence Solutions",
    "Database Administration",
    "System Integration Services",
    "IT Project Management",
    "Engineering and Design Services",
    "Construction and Renovation",
    "Facilities Management",
    "Janitorial and Custodial Services",
    "Office Supplies and Equipment",
    "Training and Professional Development",
    "Marketing and Advertising Services",
    "Consulting and Strategic Planning",
    "Human Resources Services",
    "Financial Management Services",
    "Legal Services",
    "Environmental Compliance",
    "Quality Assurance Testing",
  ];

  const descriptions = [
    "Government agency seeking qualified contractor with proven experience in this field. Must have relevant certifications and ability to meet tight deadlines.",
    "Requirements include technical expertise, team coordination, and strong communication skills. Previous government contract experience preferred.",
    "Contractor must demonstrate capability to deliver high-quality results on schedule and within budget. Security clearance may be required.",
    "This is a critical project with high visibility. Contractor should have experience with similar scope and complexity.",
    "Work involves collaboration with multiple government agencies and stakeholders. Flexibility and adaptability are essential.",
  ];

  const contracts: RealContract[] = [];
  const now = new Date();

  for (let i = 0; i < 25; i++) {
    const deadline = new Date(now.getTime() + (Math.random() * 120 + 10) * 24 * 60 * 60 * 1000);
    const value = Math.floor(Math.random() * 5000000) + 15000;
    const postedDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);

    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    contracts.push({
      id: `GOVCHEAT-${i + 1}`,
      samId: `SAM-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      title,
      description,
      simplifiedDescription: `${description.split(".")[0]}. Estimated value: $${(value / 1000).toFixed(0)}K.`,
      agency: agencies[Math.floor(Math.random() * agencies.length)],
      value,
      deadline,
      contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
      simplifiedType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
      setAside: setAsides[Math.floor(Math.random() * setAsides.length)],
      url: `https://sam.gov/opp/${Math.random().toString(36).substring(2, 15)}`,
      naicsCode: `${Math.floor(Math.random() * 900000) + 100000}`,
      postedDate,
    });
  }

  return contracts;
}

/**
 * Get realistic contracts (simulating live data)
 */
export function getRealContracts(): RealContract[] {
  return generateRealisticContracts();
}
