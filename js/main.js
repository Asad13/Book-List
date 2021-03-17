async function deleteBook(parent, child, book) {
    var toDelete = confirm(`Do you want to delete '${book.title}' from the list?`);
    if (toDelete) {
        var promise = new Promise(function (resolve, reject) {
            var pos = 0;
            var op = 1;
            child.style.position = 'absolute';
            var id = setInterval(animate, 10);
            function animate() {
                if (pos >= 50) {
                    console.log('Hello');
                    clearInterval(id);
                    resolve();
                } else {
                    pos++;
                    op -= 0.02;
                    child.style.opacity = op;
                    child.style.filter = 'alpha(opacity=' + op * 100 + ')';
                    child.style.left = '-' + pos + 'px';
                }
            }
        });
        await promise;
        parent.removeChild(child);
        var bookList = JSON.parse(localStorage.bookList);
        var books = bookList.books;

        for (var i = 0; i < books.length; i++) {
            if (books[i].id == book.id) {
                books.splice(i, 1);
                break;
            }
        }
        bookList.books = books;
        localStorage.bookList = JSON.stringify(bookList);
        if (books.length == 0) {
            document.getElementById('emptyList-container').style.display = 'block';
        }
    }
}

function showBook(book) {
    var table = document.getElementById('bookList');
    var elTr = document.createElement('tr');

    var elTdTitle = document.createElement('td');
    elTdTitle.textContent = book.title;
    elTdTitle.classList.add('title');/*,'titlesHeader'*/
    elTr.appendChild(elTdTitle);

    var elTdAuthor = document.createElement('td');
    elTdAuthor.textContent = book.author;
    elTdAuthor.classList.add('author');/*,'authorsHeader'*/
    elTr.appendChild(elTdAuthor);

    var elTdIsbn = document.createElement('td');
    elTdIsbn.classList.add('isbn');/*,'isbnsHeader'*/
    elTdIsbn.textContent = book.isbn;
    elTr.appendChild(elTdIsbn);

    var elTdDel = document.createElement('td');
    elTdDel.innerHTML = '&times;';
    elTdDel.classList.add('del');/*,delCol*/
    elTdDel.addEventListener('click', function () {
        deleteBook(this.parentElement.parentElement, this.parentElement, book);
    });
    elTr.appendChild(elTdDel);

    table.appendChild(elTr);
}

function showAllBooks() {
    removeAllBooks();
    if (sessionStorage.filtered) {
        var books = JSON.parse(sessionStorage.filtered);
        sessionStorage.removeItem('filtered');
        if (books.length > 0) {
            if (document.getElementById('emptyList-container').style.display != 'none') {
                document.getElementById('emptyList-container').style.display = 'none';
            }
            books.forEach(book => {
                showBook(book);
            });
        } else {
            document.getElementById('emptyList-container').style.display = 'block';
        }
    } else if (localStorage.bookList) {
        var books = JSON.parse(localStorage.bookList).books;
        if (books.length > 0) {
            if (document.getElementById('emptyList-container').style.display != 'none') {
                document.getElementById('emptyList-container').style.display = 'none';
            }
            books.forEach(book => {
                showBook(book);
            });
        } else {
            document.getElementById('emptyList-container').style.display = 'block';
        }
    } else {
        document.getElementById('emptyList-container').style.display = 'block';
    }
}

showAllBooks();

function feedBack(book) {
    var fb = document.createElement('div');
    fb.classList.add('feedBack');
    fb.textContent = `'${book.title}' has been added to the list sucessfully.`;
    document.getElementById('background').appendChild(fb);
    setTimeout(function () {
        document.getElementById('background').removeChild(fb);
    }, 3000);
}

function addBook(e) {
    e.preventDefault();
    var titleField = document.getElementById('title');
    var authorField = document.getElementById('author');
    var isbnField = document.getElementById('isbn');

    var title = titleField.value.trim();
    var author = authorField.value.trim();
    var isbn = isbnField.value.trim();

    if (title == "") {
        alert('Title of the book is needed');
        return;
    }
    if (author == "") {
        alert('You must specify at least one author');
        return;
    }

    var books, book;
    if (localStorage.bookList) {
        var bookList = JSON.parse(localStorage.bookList);
        books = bookList.books;
        /*if(books.length == 0){
            books = [];
        }*/
        book = {
            id: parseInt(bookList.lastId) + 1
        }
    } else {
        books = [];
        book = {
            id: 0
        }
    }

    book.title = title;
    book.author = author;

    if (isbn == "") {
        book.isbn = 'Not Specified';
    } else {
        // Checks for ISBN-10 or ISBN-13 format
        var regex = /^(?:ISBN(?:-1[03])?:? )?(?=[-0-9 ]{17}$|[-0-9X ]{13}$|[0-9X]{10}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?(?:[0-9]+[- ]?){2}[0-9X]$/;

        if (regex.test(isbn)) {
            // Remove non ISBN digits, then split into an array
            var chars = isbn.replace(/[- ]|^ISBN(?:-1[03])?:?/g, "").split("");
            // Remove the final ISBN digit from `chars`, and assign it to `last`
            var last = chars.pop();
            var sum = 0;
            var check, i;

            if (chars.length == 9) {
                // Compute the ISBN-10 check digit
                chars.reverse();
                for (i = 0; i < chars.length; i++) {
                    sum += (i + 2) * parseInt(chars[i], 10);
                }
                check = 11 - (sum % 11);
                if (check == 10) {
                    check = "X";
                } else if (check == 11) {
                    check = "0";
                }
            } else {
                // Compute the ISBN-13 check digit
                for (i = 0; i < chars.length; i++) {
                    sum += (i % 2 * 2 + 1) * parseInt(chars[i], 10);
                }
                check = 10 - (sum % 10);
                if (check == 10) {
                    check = "0";
                }
            }

            if (check == last) {
                isbn = isbn.replace(/^(?:ISBN(?:-1[03])?:?\ )?/,"");
                book.isbn = isbn;
            } else {
                alert("Invalid ISBN check digit");
                return;
            }
        } else {
            alert('Invalid ISBN');
            return;
        }
    }
    titleField.value = "";
    authorField.value = "";
    isbnField.value = "";

    books.push(book);
    if (document.getElementById('emptyList-container').style.display != 'none') {
        document.getElementById('emptyList-container').style.display = 'none';
    }
    showBook(book);
    feedBack(book);

    var bookList = {
        lastId: book.id,
        books: books
    }

    if (localStorage.bookList) {
        localStorage.bookList = JSON.stringify(bookList);
    } else {
        localStorage.setItem('bookList', JSON.stringify(bookList));
    }
}

document.getElementById('addBookForm').addEventListener('submit', addBook);

// Delete All START *******************************************************
// ************************************************************************

function removeAllBooks() {
    var parent = document.getElementById('bookList');
    var childs = document.querySelectorAll('tr');
    for (var i = 0; i < childs.length; i++) {
        if (i == 0) {
            continue;
        }
        parent.removeChild(childs[i]);
    }
}

document.getElementById('deleteAll').addEventListener('click', function () {
    var toDelete = confirm(`Do you want to delete all the books from the list?`);
    if (toDelete) {
        removeAllBooks();
    }
    localStorage.removeItem('bookList');
    document.getElementById('emptyList-container').style.display = 'block';
});

// *****************************************************************************
// Delete All END **************************************************************

// Filter By Title START *******************************************************
// *****************************************************************************

document.getElementById('filterTitle').addEventListener('keyup', function () {
    var titleSearched = this.value.trim().toLowerCase();
    if (titleSearched) {
        //replace it with sessionStorage
        var filtered = [];
        var books = JSON.parse(localStorage.bookList).books;

        books.forEach(book => {
            var title = book.title.toLowerCase();
            if (title.search(titleSearched) != -1) {
                filtered.push(book);
            }
        });
        sessionStorage.setItem('filtered', JSON.stringify(filtered));
        showAllBooks();
    } else {
        showAllBooks();
    }
});

// *****************************************************************************
//Filter By Title END **********************************************************

// Filter By Author START *******************************************************
// *****************************************************************************

document.getElementById('filterAuthor').addEventListener('keyup', function () {
    var authorSearched = this.value.trim().toLowerCase();
    if (authorSearched) {
        var filtered = [];
        var books = JSON.parse(localStorage.bookList).books;

        books.forEach(book => {
            var title = book.title.toLowerCase();
            if (title.search(authorSearched) != -1) {
                filtered.push(book);
            }
        });
        sessionStorage.setItem('filtered', JSON.stringify(filtered));
        showAllBooks();
    } else {
        removeAllBooks();
        showAllBooks();
    }
});

// *****************************************************************************
//Filter By Author END **********************************************************

// Filter By ISBN START *******************************************************
// *****************************************************************************

document.getElementById('filterISBN').addEventListener('keyup', function () {
    var isbnSearched = this.value.trim().toLowerCase();
    if (isbnSearched) {
        var filtered = [];
        var books = JSON.parse(localStorage.bookList).books;

        books.forEach(book => {
            var title = book.title.toLowerCase();
            if (title.search(isbnSearched) != -1) {
                filtered.push(book);
            }
        });
        sessionStorage.setItem('filtered', JSON.stringify(filtered));
        showAllBooks();
    } else {
        removeAllBooks();
        showAllBooks();
    }
});

// *****************************************************************************
//Filter By ISBN END **********************************************************

function noBooksText() {
    document.getElementById('emptyList-container').style.display = 'block';
}