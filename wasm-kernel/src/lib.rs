use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize, Debug)]
struct ParsedCommand {
    command: String,
    args: Vec<String>,
    operation: String,
    target: Option<String>,
    text: Option<String>,
    redirect: Option<String>,
}

#[wasm_bindgen]
pub fn init_kernel() -> String {
    "zenit-kernel-0.1".to_string()
}

#[wasm_bindgen]
pub fn resolve_path(input: &str, cwd: &str) -> String {
    normalize_path(input, cwd)
}

#[wasm_bindgen]
pub fn exec_command(command_line: &str, cwd: &str) -> Result<JsValue, JsValue> {
    let tokens = tokenize(command_line);
    let command = tokens.first().cloned().unwrap_or_default();
    let args = if tokens.len() > 1 {
        tokens[1..].to_vec()
    } else {
        Vec::new()
    };

    let lower = command.to_lowercase();
    let parsed = match lower.as_str() {
        "help" => ParsedCommand {
            command,
            args,
            operation: "help".to_string(),
            target: None,
            text: None,
            redirect: None,
        },
        "ls" => ParsedCommand {
            command,
            target: Some(resolve_path(args.first().map(String::as_str).unwrap_or("."), cwd)),
            args,
            operation: "ls".to_string(),
            text: None,
            redirect: None,
        },
        "cd" => ParsedCommand {
            command,
            target: Some(resolve_path(args.first().map(String::as_str).unwrap_or("/Home"), cwd)),
            args,
            operation: "cd".to_string(),
            text: None,
            redirect: None,
        },
        "pwd" => ParsedCommand {
            command,
            args,
            operation: "pwd".to_string(),
            target: None,
            text: None,
            redirect: None,
        },
        "cat" | "mkdir" | "touch" | "open" => ParsedCommand {
            command,
            target: args.first().map(|value| resolve_path(value, cwd)),
            args,
            operation: lower,
            text: None,
            redirect: None,
        },
        "echo" => {
            let redirect_index = args.iter().position(|token| token == ">");
            let redirect = redirect_index
                .and_then(|index| args.get(index + 1))
                .map(|value| resolve_path(value, cwd));
            let content_slice = redirect_index.unwrap_or(args.len());
            let text = args[..content_slice].join(" ");

            ParsedCommand {
                command,
                args,
                operation: "echo".to_string(),
                target: None,
                text: Some(text),
                redirect,
            }
        }
        "clear" => ParsedCommand {
            command,
            args,
            operation: "clear".to_string(),
            target: None,
            text: None,
            redirect: None,
        },
        _ => ParsedCommand {
            command,
            args,
            operation: "unknown".to_string(),
            target: None,
            text: None,
            redirect: None,
        },
    };

    serde_wasm_bindgen::to_value(&parsed).map_err(|error| JsValue::from_str(&error.to_string()))
}

fn tokenize(input: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut current = String::new();
    let mut quote: Option<char> = None;

    for ch in input.chars() {
        match ch {
            '"' | '\'' => {
                if quote == Some(ch) {
                    quote = None;
                } else if quote.is_none() {
                    quote = Some(ch);
                } else {
                    current.push(ch);
                }
            }
            '>' if quote.is_none() => {
                if !current.is_empty() {
                    tokens.push(current.clone());
                    current.clear();
                }
                tokens.push(">".to_string());
            }
            ' ' | '\t' if quote.is_none() => {
                if !current.is_empty() {
                    tokens.push(current.clone());
                    current.clear();
                }
            }
            _ => current.push(ch),
        }
    }

    if !current.is_empty() {
        tokens.push(current);
    }

    tokens
}

fn normalize_path(input: &str, cwd: &str) -> String {
    let raw = if input.trim().is_empty() { cwd } else { input };
    let base = if raw.starts_with('/') {
        raw.to_string()
    } else if cwd == "/" {
        format!("/{}", raw)
    } else {
        format!("{}/{}", cwd.trim_end_matches('/'), raw)
    };

    let mut stack: Vec<&str> = Vec::new();

    for segment in base.split('/') {
        match segment {
            "" | "." => {}
            ".." => {
                stack.pop();
            }
            value => stack.push(value),
        }
    }

    if stack.is_empty() {
        "/".to_string()
    } else {
        format!("/{}", stack.join("/"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolves_relative_segments() {
        assert_eq!(resolve_path("../Notes", "/Home/Projects"), "/Home/Notes");
    }

    #[test]
    fn tokenizes_quotes_and_redirects() {
        assert_eq!(
            tokenize("echo \"hello world\" > /Home/Notes/demo.md"),
            vec!["echo", "hello world", ">", "/Home/Notes/demo.md"]
        );
    }

    #[test]
    fn normalizes_root_and_dots() {
        assert_eq!(resolve_path("./Field Notes.md", "/Home/Notes"), "/Home/Notes/Field Notes.md");
        assert_eq!(resolve_path("/", "/Home/Notes"), "/");
    }
}
