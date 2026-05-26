const fs = require('fs');

const files = ['AIDemandForecastingDetail.html', 'MySupplyChainDashboard.html', 'ProductInventoryList.html'];

files.forEach(file => {
    let content = fs.readFileSync(`../StitchUI/${file}`, 'utf-8');
    let bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if(bodyMatch) {
        content = bodyMatch[1];
    }
    
    content = content.replace(/class=/g, 'className=');
    
    // convert inline styles
    content = content.replace(/style="([^"]*)"/g, (match, stylesStr) => {
        const rules = stylesStr.split(';').filter(s => s.trim());
        const reactStyles = rules.map(rule => {
            const parts = rule.split(':');
            if (parts.length < 2) return '';
            const key = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            const value = parts.slice(1).join(':').trim();
            // Handle string literal quotes
            const cleanValue = value.replace(/'/g, "\\'");
            return `${key}: '${cleanValue}'`;
        }).filter(Boolean);
        return `style={{ ${reactStyles.join(', ')} }}`;
    });
    
    // self-closing tags
    content = content.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
    content = content.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
    content = content.replace(/<br([^>]*[^\/])>/g, '<br$1 />');
    content = content.replace(/<hr([^>]*[^\/])>/g, '<hr$1 />');
    content = content.replace(/disabled=""/g, 'disabled');
    content = content.replace(/<!--(.*?)-->/gs, '{/*$1*/}');

    // React Router links
    content = content.replace(/<a ([^>]*)>([\s\S]*?)Dashboard\s*<\/a>/g, '<Link to="/" $1>$2Dashboard</Link>');
    content = content.replace(/<a ([^>]*)>([\s\S]*?)Inventory\s*<\/a>/g, '<Link to="/inventory" $1>$2Inventory</Link>');
    content = content.replace(/<a ([^>]*)>([\s\S]*?)Forecasting\s*<\/a>/g, '<Link to="/forecasting" $1>$2Forecasting</Link>');
    content = content.replace(/<Link ([^>]*)href="#"/g, '<Link $1');
    
    // SVG and HTML React specific cases
    content = content.replace(/preserveaspectratio=/g, 'preserveAspectRatio=');
    content = content.replace(/stroke-width=/g, 'strokeWidth=');
    content = content.replace(/stroke-dasharray=/g, 'strokeDasharray=');
    content = content.replace(/stroke-dashoffset=/g, 'strokeDashoffset=');
    content = content.replace(/fill-opacity=/g, 'fillOpacity=');

    let componentName = file.replace('.html', '');
    let jsx = `import React from 'react';
import { Link } from 'react-router-dom';

export default function ${componentName}() {
    return (
        <React.Fragment>
            ${content}
        </React.Fragment>
    );
}
`;
    fs.writeFileSync(`src/pages/${componentName}.tsx`, jsx);
});
