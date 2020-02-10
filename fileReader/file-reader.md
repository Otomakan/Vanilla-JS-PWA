---
layout: page-fullwidth
title: Reading and Processing files in the browser with FileReader
,
categories:
    - JS
tags:
    - bacon
header: no
breadcrumb: true
meta_description: "Description in the range of 80 to 155 characters."
author: Jack Misteli
---

Reading, writing and analyzing files is an essential component of software development. For security reasons, in JavaScript, we can't directly access users' files. If we had something like `fs` in Node, we could just steal documents from users! 

First, to get a file from a user, we need to use an input component.

```html
<input id="my-input" type="file" onChange="handleFileChange">
```

This tiny piece of code will allow our user to upload files from her machine. The `handleFileChange` function will give some information about the files but to be able to manipulate it we need to use `FileReader`.

## Simply uploading your file

Here is a simple piece of code to upload a file using an HTML form.

```html
<form enctype="multipart/form-data" action="/upload" method="post">
    <input id="file-input" type="file" />
</form>
```

There is only so much you can get from an HTML form POST. If you prefer to use JavaScript to make your requests you can do something like this:

```js
let file = document.getElementById("file-input").files[0];
let formData = new FormData();

formData.append("file", file);
fetch('/upload/image', {method: "POST", body: formData});
```

## File Blob properties

In many browsers, Files have Blob properties. These functions allows us to read the file. We are going to use a file called `myFile.txt` which looks like this:

```txt
File content!
```

```js
(async () => {
    // .text() transforms the file into a stream and then into a string
    const fileContent = await file.text();
    console.log(fileContent);
    // logs "File content!"

    // .stream() returns a ReadableStream
    const fileContentStream = await file.stream();
    console.log(await streamToText(fileContentStream));
    // logs "File content!"

    const buffer = await file.arrayBuffer();
    console.log(bufferToText(buffer))
    // logs "File content!"

    // .slice() allows you to get slices of the file here we take a slice of the entire file
    const fileSliceBlob = file.slice(0, file.length);
    // we convert to blob to a stream
    const fileSliceBlobStream = await fileSliceBlob.stream();
    console.log(await streamToText(fileSliceBlobStream));
    // logs "File content!"

})()

// We just use this function to convert streams to text
const streamToText = async (blob) => {
    const readableStream = await blob.getReader();
    const chunk = await readableStream.read();
    return new TextDecoder('utf-8').decode(chunk.value);
}

// Not the best way to get text from a file!
const bufferToText = (buffer) => {
    const bufferByteLength = buffer.byteLength;
    const bufferUint8Array = new Uint8Array(buffer, 0, bufferByteLength);
    return new TextDecoder().decode(bufferUint8Array);
}
```

The problem is that a few important browsers don't support these File's Blob properties. 

## Some FileReader Code

The FileReader API is used much more broadly. As you will see we have similar features to the File interface. We also have additional features.

## FileReader Life Cycle

There are 6 main events attached to FileReader:

- loadstart: Fires when we start loading a file.
- progress: Fires when the blob is read in memory.
- abort: Fires when we call `.abort`
- error: Fires when an error occurs
- load: Fires when the read is successful.
- loadend: Fires when the file is loaded and if error or abort didn't get called or if load starts a new read.

## FileReader Methods

To start loading our file we have four methods:

- readAsArrayBuffer(file): Reads the file or blob as an array buffer. One use case is to send large files to a service worker.
- readAsBinaryString(file): Reads the file as a binary string
- readAsText(file, format): Reads the file as USVString (almost like a string), and you can specify an optional format.
- readAsDataURL(file): This will return a url where you can access the file's content, it is Base64 encoded and ready to send to your server

Here is some code you can use to see FileReader in action.

```html

<body>
  <input type='file' id='input'>
  <progress value="0" max="100" id="progress-bar"></progress>
  <div id="status"></div>
  <script>

  //
  document.getElementById('input').addEventListener('change', (e) => {
    const file = document.getElementById('input').files[0];
    if (file) {
      processFile(file);
    }
  })

  const processFile = (file) => {
    // we define fr as a new instance of FileReader
    const fr = new FileReader();

    fr.readAsDataURL(file);
    // Handle progress, success, and errors
    // fr.onprogress = updateProgress;
    fr.onerror = errorHandler;
    fr.onabort = () => changeStatus('Start Loading');
    fr.onloadstart =   () => changeStatus('Start Loading');
    fr.onload = ()=> {changeStatus('Loaded')};
    fr.onloadend = () => loaded;
    // Here you can perform some operations on the data asynchronously
    fr.onprogress = setProgress;
  }

  // Updates the value of the progress bar
  const setProgress = (e) => {
    // The target is the file reader
    const fr = e.target;
    const loadingPercentage =  100 * e.loaded / e.total;
    document.getElementById('progress-bar').value = loadingPercentage;
  }

  const changeStatus = (status) => {
    document.getElementById('status').innerHTML = status
  }

  const loaded = (e) => {
    changeStatus('Load ended!');
    const fr = e.target
    var result = fr.result;
    console.log('result:')
    console.log(result)
    // Here we can send the result to a server for example
  }

  const errorHandler = (e) => {
    changeStatus("Error: " + e.target.error.name)
  }

</script>
</body>

```

You can see the code live [here](https://otomakan.github.io/jmisteli.github.io/snippets/file-reader/index.html) (open your developer console) and the source code [here](https://github.com/Otomakan/jmisteli.github.io/blob/master/snippets/file-reader/index.html).

## File Reader on Threads

FileReader is an asynchronous API because we do not want to block the main thread. For example, we don't want our UI to stop working when the browser is trying to read a very large file. However, there is a synchronous  version of FileReader called FileReaderSync. We can only use FileReaderSync in WebWorkers. Web workers have their own thread so they won't block the main thread. FileReaderSync uses the same methods as FileReader:

- FileReaderSync.readAsArrayBuffer()
- FileReaderSync.readAsBinaryString()
- FileReaderSync.readAsText()
- FileReaderSync.readAsDataURL()

There are no event handlers because it is synchronous!
