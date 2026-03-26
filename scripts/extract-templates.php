<?php
/**
 * Salient Studio Template Extractor
 * 
 * Parses salient-studio-templates.php and extracts all templates into a JSON catalog.
 * Run: php extract-templates.php <path-to-salient-studio-templates.php>
 */

if ($argc < 2) {
    echo "Usage: php extract-templates.php <path-to-salient-studio-templates.php>\n";
    exit(1);
}

$filePath = $argv[1];
if (!file_exists($filePath)) {
    echo "File not found: $filePath\n";
    exit(1);
}

$content = file_get_contents($filePath);

// Extract category display names
$catNames = [];
if (preg_match("/\\\$cat_display_names\s*=\s*array\((.*?)\);/s", $content, $catMatch)) {
    preg_match_all("/'(\w+)'\s*=>\s*esc_html__\(\s*'([^']+)'/", $catMatch[1], $cats);
    for ($i = 0; $i < count($cats[1]); $i++) {
        $catNames[$cats[1][$i]] = $cats[2][$i];
    }
}

// Split by template blocks - each starts with $data = array();
$blocks = preg_split('/\$data\s*=\s*array\(\);/', $content);
array_shift($blocks); // Remove the header part

$templates = [];
$index = 0;

foreach ($blocks as $block) {
    $template = [];
    
    // Extract name
    if (preg_match("/\\\$data\['name'\]\s*=\s*esc_html__\(\s*'([^']+)'/", $block, $m)) {
        $template['name'] = $m[1];
    } else {
        continue;
    }
    
    // Extract custom_class (contains categories and date)
    $categories = [];
    $date = '';
    if (preg_match("/\\\$data\['custom_class'\]\s*=\s*'([^']+)'/", $block, $m)) {
        $classStr = $m[1];
        $parts = explode(' ', $classStr);
        foreach ($parts as $part) {
            if (strpos($part, 'date-') === 0) {
                $date = substr($part, 5);
            } else {
                $categories[] = $part;
            }
        }
    }
    $template['categories'] = $categories;
    $template['date'] = $date;
    
    // Extract cat_display_name
    if (preg_match("/\\\$data\['cat_display_name'\]\s*=\s*(.+?);/", $block, $m)) {
        $expr = trim($m[1]);
        // Resolve display name from expression
        $displayParts = [];
        preg_match_all("/\\\$cat_display_names\['(\w+)'\]/", $expr, $refs);
        foreach ($refs[1] as $ref) {
            if (isset($catNames[$ref])) {
                $displayParts[] = $catNames[$ref];
            }
        }
        // Also check for direct esc_html__ calls
        preg_match_all("/esc_html__\(\s*'([^']+)'/", $expr, $directNames);
        foreach ($directNames[1] as $dn) {
            $displayParts[] = $dn;
        }
        $template['categoryDisplay'] = implode(', ', $displayParts);
    }
    
    // Extract image filename
    if (preg_match("/templates\/([^'\"]+)/", $block, $m)) {
        $template['image'] = $m[1];
    } else {
        $template['image'] = '';
    }
    
    // Extract shortcode content (heredoc)
    if (preg_match("/\\\$data\['content'\]\s*=\s*<<<\s*(?:CONTENT|'CONTENT')\s*\n(.*?)\nCONTENT;/s", $block, $m)) {
        $template['content'] = trim($m[1]);
    } else {
        continue;
    }
    
    // Generate slug
    $template['slug'] = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $template['name']));
    $template['slug'] = trim($template['slug'], '-');
    
    // Extract shortcode types used
    preg_match_all('/\[(\w+)[\s\]]/', $template['content'], $shortcodes);
    $template['shortcodesUsed'] = array_values(array_unique($shortcodes[1]));
    
    $template['id'] = $index;
    $templates[] = $template;
    $index++;
}

// Write full catalog
$outputDir = __DIR__ . '/../data';
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

file_put_contents(
    $outputDir . '/templates.json',
    json_encode($templates, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Write lightweight index (no content field)
$index = array_map(function($t) {
    return [
        'id' => $t['id'],
        'name' => $t['name'],
        'slug' => $t['slug'],
        'categories' => $t['categories'],
        'categoryDisplay' => $t['categoryDisplay'],
        'image' => $t['image'],
        'date' => $t['date'],
        'shortcodesUsed' => $t['shortcodesUsed'],
    ];
}, $templates);

file_put_contents(
    $outputDir . '/templates-index.json',
    json_encode($index, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

// Write category summary
$categorySummary = [];
foreach ($templates as $t) {
    foreach ($t['categories'] as $cat) {
        if (!isset($categorySummary[$cat])) {
            $categorySummary[$cat] = ['slug' => $cat, 'name' => $catNames[$cat] ?? ucfirst(str_replace('_', ' ', $cat)), 'count' => 0];
        }
        $categorySummary[$cat]['count']++;
    }
}
file_put_contents(
    $outputDir . '/categories.json',
    json_encode(array_values($categorySummary), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo "Extracted " . count($templates) . " templates\n";
echo "Categories: " . implode(', ', array_keys($categorySummary)) . "\n";
echo "Output: $outputDir/templates.json, templates-index.json, categories.json\n";
