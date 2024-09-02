const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
var cors = require('cors');
const { htmlToText } = require('html-to-text');
const moment = require('moment');  // moment 라이브러리를 사용



const app = express();
const port = 8080;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const connection1 = mysql.createConnection({
//   host: '172.104.71.209',
//   user: 'cgloria',
//   password: 'cgloria1234',
//   database: 'dev_cgloria'
// });

const connection1 = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'bible'
});


// const connection1 = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '0000',
//   database: 'cglori_hp_data'
// });
connection1.connect(err => {
  if (err) {
    console.error('Database connection1 failed: ', err.stack);
    return;
  }
  console.log('Connected to database1');
});

// const connection2 = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '0000',
//   database: 'cgloria_dev'
// });
// connection2.connect(err => {
//   if (err) {
//     console.error('Database connection2 failed: ', err.stack);
//     return;
//   }
//   console.log('Connected to database2');
// });


const escapeSingleQuotes = (str) => {
          return str.replace(/'/g, "\\'");
};

function extractTextFromHtml(html) {
  // HTML을 텍스트로 변환
  const text = htmlToText(html, {
    wordwrap: 130,
    ignoreImage: true,
    ignoreHref: true,
    noLinks: true, // 링크를 제거하려면 true로 설정
    // 다른 옵션은 필요에 따라 추가할 수 있습니다.
  });

  return text;
}


function getData() {
  return new Promise((resolve, reject) => {
    connection1.query(
      `SELECT title, content, user_id, user_name, member_srl, regdate, last_update FROM xe_documents WHERE module_srl = 161 order by regdate asc`,
      (error, results, fields) => {
        if (error) return reject(error);

        
console.log("results.length: ", results.length);
        // 날짜 포맷팅
        results.forEach(element => {
          element.regdate = moment(element.regdate, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
          element.last_update = moment(element.last_update, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss');
          if (element.title) {
              element.title = escapeSingleQuotes(element.title);
            }
          if (element.content) {
              element.content = escapeSingleQuotes(element.content);
              // element.content = extractTextFromHtml(element.content)
            }
        });
        // console.log("results: ", results);
        resolve(results);
      }
    );
  });
}


function createData(data) {
  console.log("data: ", data);

  data.forEach(data => {
    console.log("data ====", data);
    connection2.query(`INSERT INTO class_meeting (title, content, writer, writer_name, create_at, update_at)
VALUES ('${data.title}', '${data.content}', '${data.user_id}', '${data.user_name}','${data.regdate}', '${data.last_update}')`, (error, results) => {
  if (error) throw error;
  console.log('Data inserted successfully');
});
  })


}


app.get('/moto_data', async (req, res) => {
  try {
    const data = await getData();
    createData(data)
    res.json("success")
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});







app.post('/sermon', (req, res) => {
 console.log(req.body);
 const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM sermon ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/sermon_count', (req, res) => {
  connection1.query('SELECT count(*) FROM sermon', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});



app.post('/column', (req, res) => {
 const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM column_table ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/column_count', (req, res) => {
  connection1.query('SELECT count(*) FROM column_table', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/weekly', (req, res) => {
  const {startRow, pageSize } = req.body
  connection1.query(`SELECT * FROM weeks_Script ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/weekly_count', (req, res) => {
  connection1.query('SELECT count(*) FROM weeks_Script', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/small', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM class_table ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/small_count', (req, res) => {
  connection1.query('SELECT count(*) FROM class_table', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/notice', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM notice ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/notice_count', (req, res) => {
  connection1.query('SELECT count(*) FROM notice', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/library', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM school_library ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/library_count', (req, res) => {
  connection1.query('SELECT count(*) FROM school_library', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/free', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM free_table ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/free_count', (req, res) => {
  connection1.query('SELECT count(*) FROM free_table', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/testimony', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM testimony ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/testimony_count', (req, res) => {
  connection1.query('SELECT count(*) FROM testimony', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/photo', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM photo ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/photo_count', (req, res) => {
  connection1.query('SELECT count(*) FROM photo', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/school_photo', (req, res) => {
  const {startRow, pageSize} = req.body
  connection1.query(`SELECT * FROM school_photo ORDER BY id DESC LIMIT ${pageSize} OFFSET ${startRow}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.get('/school_photo_count', (req, res) => {
  connection1.query('SELECT count(*) FROM school_photo', (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/contacts', (req, res) => {
  const { name, phone, email, memo } = req.body;
  const regdate = new Date().toISOString();

  const query = 'INSERT INTO contact (name, phone, email, memo, regdate) VALUES (?, ?, ?, ?, ?)';
  const values = [name, phone, email, memo, regdate];

  connection1.query(query, values, (error, results, fields) => {
    if (error) {
      console.error('Error inserting contact: ', error);
      res.status(500).json({ error: 'Error inserting contact' });
      return;
    }
    res.json({ message: 'Contact inserted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/training', (req, res) => {
  const {id} = req.body;
  console.log("id: ", id);
  connection1.query(`SELECT * FROM training WHERE id = ${id}`, (error, results, fields) => {
  
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/diary', (req, res) => {
  const {training_num, startRow, pageSize} = req.body;
  console.log("training_num: ", training_num);
  connection1.query(`SELECT
                     * 
                    FROM training_diary
                    WHERE training_id = ${training_num}
                    LIMIT ${pageSize} 
                    OFFSET ${startRow}`,
                     (error, results, fields) => {
  
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/diary_count', (req, res) => {
  const {training_num} = req.body;
  connection1.query(`SELECT count(*) FROM training_diary WHERE training_id = ${training_num}`, (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/assignment', (req, res) => {
  const {training_num, startRow, pageSize} = req.body;
  console.log("training_num: ", training_num);
  connection1.query(`SELECT
                     * 
                    FROM training_assignment
                    WHERE training_id = ${training_num}
                    LIMIT ${pageSize} 
                    OFFSET ${startRow}`
                    , (error, results, fields) => {
  
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/assignment_count', (req, res) => {
  const {training_num} = req.body;
  connection1.query(`SELECT count(*) FROM training_assignment WHERE training_id = ${training_num}`, (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/training_notice', (req, res) => {
  const {training_num, startRow, pageSize} = req.body;
  console.log("training_num: ", training_num); 
  connection1.query(`SELECT
                     * 
                    FROM training_notice
                    WHERE training_id = ${training_num}
                    LIMIT ${pageSize} 
                    OFFSET ${startRow}`
                    , (error, results, fields) => {
  
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/training_notice_count', (req, res) => {
  const {training_num} = req.body;
  connection1.query(`SELECT count(*) FROM training_notice WHERE training_id = ${training_num}`, (error, results, fields) => {
    console.log("results: ", results);
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const {username, password} = req.body;
  console.log(username);
  console.log(password);
 
  connection1.query(`SELECT * FROM user WHERE password = '${password}' AND username = '${username}'`, (error, results, fields) => {
    
    console.log("result: ", results);

    if (!results || results.length === 0) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: '찾으시는 계정이 없습니다.' });
      return;
    }
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });

 
});

app.post('/write_sermon', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO sermon (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_column', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO column_table (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_column', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO column_table (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_small', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO class_table (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_weekly', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO weeks_Script (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_library', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO school_library (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_free', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO free_table (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_testimony', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO testimony (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/write_notice', (req, res) => {
  const {writer, title, content} = req.body;
  connection1.query(`INSERT INTO notice (writer ,title, content) VALUES ('${writer}', '${title}', '${content}');
`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/detail/sermon', (req, res) => {
 console.log(req.body);
 const {id} = req.body
  connection1.query(`SELECT * FROM sermon WHERE id = ${id}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});
app.post('/detail/column', (req, res) => {
 console.log(req.body);
 const {id} = req.body
  connection1.query(`SELECT * FROM Column_Table WHERE id = ${id}`, (error, results, fields) => {
    if (error) {
      console.error('Error fetching contacts: ', error);
      res.status(500).json({ error: 'Error fetching contacts' });
      return;
    }
    res.json(results);
  });
});

app.post('/bible', (req, res) => {
  connection1.query('SELECT * FROM bible2 LIMIT 100', (error, results, fields) => {
    if (error) throw error;

    console.log("results: ", results);

    let saveChapter = 0;
    

    function getFirstSumCountAndIdx(results, saveChapter) {

      let arr = []
      console.log("results: ", results);
      
      for (let index = 0; index < results.length; index++) {
        const element = results[index];

        console.log("element: ", element);
        saveChapter = element.chapter
        /**
         * 240828 수업
         * 챕터당 절 끝까지는 구했음
         * 하지만, 그것을 구분하는 조건의 변수는 구하지 못했음
         * 
         * 이것을 구하면, 다음에는 절의 시작과 끝의 글자수를 더해서 countOfChapter 컬럼에 넣어주기까지
         */
        if (element.chapter === 2) {

    
          arr.push(element.paragraph)
        } 
      }
     
    }

    // 사용 예시
    const result = getFirstSumCountAndIdx(results, saveChapter);

    console.log("result: ", result[result.length-1]);

    res.json(result);  // 결과를 클라이언트에 응답
  });
});


function addWordCount(length, idx) {

  connection1.query(`UPDATE bible2 SET count = ${length} WHERE idx = ${idx};`, (error, results, fields) => {
   


    if (error) {
      console.log("error: ", error);
    }

    console.log("results: ", results);

  });
  
  
}

function addEndOfChapter(length, idx) {

  connection1.query(`UPDATE bible2 SET endOfChapter = ${idx} WHERE idx = ${length};`, (error, results, fields) => {
   


    if (error) {
      console.log("error: ", error);
    }

    console.log("results: ", results);

  });
  
  
}
