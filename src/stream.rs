use regex::Regex;
use std::io::{BufRead, BufReader};
use std::process::ChildStdout;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use crate::consts::LOG_PREFIX;

lazy_static::lazy_static! {
    static ref LOG_PREFIX_REGEX: Regex = Regex::new(LOG_PREFIX).unwrap();
}

fn remove_last_newline(string: &str) -> &str {
    string.strip_suffix('\n').unwrap_or(string)
}

pub struct LogDelimiterStream(Receiver<String>);

impl LogDelimiterStream {
    pub fn new(stdout: ChildStdout) -> Self {
        Self(Self::start(stdout))
    }

    fn start(stdout: ChildStdout) -> Receiver<String> {
        let (tx, rx) = channel::<String>();

        let mut read_buffer = BufReader::new(stdout);
        let buffer = Arc::new(Mutex::new(String::new()));

        thread::spawn(move || loop {
            let mut line = String::new();
            let num_bytes = read_buffer.read_line(&mut line);

            if let Ok(0) = num_bytes {
                break;
            }

            let mut buffer_g = buffer.lock().unwrap();

            if LOG_PREFIX_REGEX.is_match(&line) && !buffer_g.is_empty() {
                tx.send(remove_last_newline(&buffer_g).to_string()).unwrap();
                buffer_g.clear();
            }

            buffer_g.push_str(&line);

            Self::handle_timeout(&buffer, &tx)
        });

        rx
    }

    fn handle_timeout(buffer: &Arc<Mutex<String>>, tx: &Sender<String>) {
        let buffer2 = Arc::clone(buffer);
        let tx2: Sender<String> = tx.clone();
        thread::spawn(move || {
            thread::sleep(Duration::from_millis(50));

            let mut buffer_g = buffer2.lock().unwrap();

            if buffer_g.is_empty() {
                return;
            }

            tx2.send(remove_last_newline(&buffer_g).to_string())
                .unwrap();
            buffer_g.clear();
        });
    }
}

impl Iterator for LogDelimiterStream {
    type Item = String;

    fn next(&mut self) -> Option<Self::Item> {
        self.0.recv().ok()
    }
}
