<?php
http_response_code(200);
header("Content-Type: text/html; charset=UTF-8");
readfile(__DIR__ . "/index.html");
