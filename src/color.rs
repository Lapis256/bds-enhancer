use std::fmt::{self, Display, Formatter};

pub enum Color {
    Red,
    Yellow,
    White,
    Reset,
}

impl Color {
    pub fn as_ansi_code(&self) -> &str {
        match self {
            Color::Red => "\x1b[91m",
            Color::Yellow => "\x1b[93m",
            Color::White => "\x1b[97m",
            Color::Reset => "\x1b[0m",
        }
    }
}

impl Display for Color {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_ansi_code())
    }
}
