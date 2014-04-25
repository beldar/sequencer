<?php
if (count($argv) !== 3) {
    echo 'Usage: php compiler.php "/path/to/pngs" "file_name.js"'.PHP_EOL;
    exit;
}
$origdir = __DIR__;
$dir = $argv[1];
$outputname = $argv[2];
chdir($dir);
$files = scandir($dir);
$output = '[';
$n = 0;
foreach ($files as $file) {
    if ($file != '.' && $file!='..') {
        $output .= "'".base64_encode_image($file, 'png')."',";
        $n++;
    }
}
$output = substr($output, 0, -1);
$output .= ']';
chdir($origdir);
file_put_contents($outputname, $output);
echo "File created correctly $outputname containing $n images".PHP_EOL;

function base64_encode_image ($filename=string,$filetype=string) {
    if ($filename) {
        $imgbinary = fread(fopen($filename, "r"), filesize($filename));
        return 'data:image/' . $filetype . ';base64,' . base64_encode($imgbinary);
    }
}
?>
