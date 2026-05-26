const fs = require('fs');

const files = ['AIDemandForecastingDetail.tsx', 'MySupplyChainDashboard.tsx', 'ProductInventoryList.tsx'];

files.forEach(file => {
    let content = fs.readFileSync(`src/pages/${file}`, 'utf-8');
    
    if (!content.includes("import { Link }")) {
        content = content.replace("import React from 'react';", "import React from 'react';\nimport { Link } from 'react-router-dom';");
    }
    
    content = content.replace(/<a([^>]*)>([\s\S]*?)Dashboard\s*<\/a>/, '<Link to="/"$1>$2Dashboard</Link>');
    content = content.replace(/<a([^>]*)>([\s\S]*?)Inventory\s*<\/a>/, '<Link to="/inventory"$1>$2Inventory</Link>');
    content = content.replace(/<a([^>]*)>([\s\S]*?)Forecasting\s*<\/a>/, '<Link to="/forecasting"$1>$2Forecasting</Link>');
    
    content = content.replace(/<Link([^>]*)href="#"/g, '<Link$1');
    
    fs.writeFileSync(`src/pages/${file}`, content);
});
