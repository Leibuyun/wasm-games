use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use wasm_bindgen::prelude::*;

mod point;
mod utils;

use point::{Point, PointWithParent};

#[wasm_bindgen]
pub struct Board {
    board: Vec<bool>,
    size: usize,
    cat_pos: Point,
    padding: usize,
    cell_size: f64,
    x_gap: f64,
    y_gap: f64,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BoardProps {
    row: usize,
    col: usize,
    cell_size: f64,
    padding: usize,
    x_gap: f64,
    y_gap: f64,
}

#[wasm_bindgen]
impl Board {
    pub fn new(canvas_width: f64, size: usize, padding: usize, x_gap: f64) -> Self {
        let cell_size = (canvas_width - padding as f64 * 2.0 - x_gap * (size as f64 - 1.0))
            / (size as f64 + 0.5);
        let y_gap =
            (canvas_width - padding as f64 * 2.0 - size as f64 * cell_size) / (size as f64 - 1.0);
        let board = vec![false; size * size];
        Self {
            size,
            padding,
            board,
            cat_pos: Point::default(),
            cell_size,
            x_gap,
            y_gap,
        }
    }

    pub fn init(&mut self) {
        self.reset_cat();
        self.generate_board();
    }

    pub fn get_props(&self) -> JsValue {
        let board_props = BoardProps {
            row: self.size,
            col: self.size,
            padding: self.padding,
            cell_size: self.cell_size,
            x_gap: self.x_gap,
            y_gap: self.y_gap,
        };
        serde_wasm_bindgen::to_value(&board_props).unwrap()
    }

    pub fn get_rect_xy(&self, cat_x: usize, cat_y: usize) -> JsValue {
        let extra_x = if cat_y % 2 == 1 {
            self.cell_size / 2.0
        } else {
            0.0
        };
        let x = self.padding as f64
            + cat_x as f64 * self.cell_size
            + self.x_gap * cat_x as f64
            + extra_x;
        let y = self.padding as f64 + cat_y as f64 * self.cell_size + self.y_gap * cat_y as f64;
        let point = HashMap::<&str, f64>::from([
            ("x", x),
            ("y", y),
            ("cat_x", cat_x as f64),
            ("cat_y", cat_y as f64),
        ]);
        serde_wasm_bindgen::to_value(&point).unwrap()
    }

    pub fn get_cat_rect_start_xy(&self) -> JsValue {
        self.get_rect_xy(self.cat_pos.x, self.cat_pos.y)
    }

    pub fn cells(&self) -> *const bool {
        self.board.as_ptr()
    }

    fn get_idx(&self, x: usize, y: usize) -> usize {
        y * self.size + x
    }

    fn get_value(&self, x: usize, y: usize) -> bool {
        let idx = self.get_idx(x, y);
        self.board[idx]
    }

    fn set_value(&mut self, x: usize, y: usize, value: bool) {
        let idx = self.get_idx(x, y);
        self.board[idx] = value;
    }

    pub fn reset_cat(&mut self) {
        let pos = self.size / 2;
        self.cat_pos = Point::new(pos, pos);
    }

    pub fn generate_board(&mut self) {
        self.board.iter_mut().for_each(|cell| *cell = false);
        for _ in 0..(self.size + utils::generate_random_number(0, 5)) {
            loop {
                let x = utils::generate_random_number(0, self.size);
                let y = utils::generate_random_number(0, self.size);
                if (x == self.cat_pos.x && y == self.cat_pos.y) || self.get_value(x, y) {
                    continue;
                }
                self.set_value(x, y, true);
                break;
            }
        }
    }

    pub fn check_number_ok(&self, num1: isize, num2: isize) -> bool {
        num1 == num2 && num1 >= 0 && num1 < self.size as isize
    }

    // 鼠标点击的位置，是否位于棋盘上
    pub fn calc_pos_index(&self, x: f64, y: f64) -> Option<Point> {
        let number_y1 =
            ((y - self.padding as f64) / (self.cell_size + self.y_gap)).floor() as isize;
        let number_y2 = ((y - self.padding as f64 - self.cell_size) / (self.cell_size + self.y_gap))
            .ceil() as isize;
        if self.check_number_ok(number_y1, number_y2) {
            let is_odd = number_y1 % 2 == 1;
            let extra_x = if is_odd { self.cell_size / 2.0 } else { 0.0 };
            let number_x1 = ((x - self.padding as f64 - extra_x) / (self.cell_size + self.x_gap))
                .floor() as isize;
            let number_x2 = ((x - self.padding as f64 - self.cell_size - extra_x)
                / (self.cell_size + self.x_gap))
                .ceil() as isize;
            if self.check_number_ok(number_x1, number_x2) {
                return Some(Point::new(number_x1 as usize, number_y1 as usize));
            }
        }
        None
    }

    // 检查是否能放置障碍物
    pub fn check_hindrance_ok(&self, x: usize, y: usize) -> bool {
        !(x == self.cat_pos.x && y == self.cat_pos.y) && !self.get_value(x, y)
    }

    // 放置障碍物
    pub fn put_hindrance(&mut self, x: usize, y: usize) {
        self.set_value(x, y, true);
    }

    pub fn set_cat(&mut self, x: usize, y: usize) {
        self.cat_pos = Point::new(x, y);
    }

    pub fn bfs(&self) -> Option<Point> {
        let mut queue = VecDeque::<PointWithParent>::new();
        queue.push_back(PointWithParent {
            point: self.cat_pos.clone(),
            parent: None,
        });
        let mut map = HashMap::<String, bool>::new();
        while let Some(current) = queue.pop_front() {
            let Point { x, y } = current.point;
            let key = format!("{}:{}", x, y);
            map.insert(key, true);

            if x == 0 || x == self.size - 1 || y == 0 || y == self.size - 1 {
                let mut p = &current;
                let mut last = p.clone();
                while let Some(parent) = &p.parent {
                    last = p.clone();
                    p = parent;
                }
                return Some(last.into());
            }
            let v: isize = if y % 2 == 1 { 1 } else { -1 };
            let directions = vec![[-1, 0], [-1, v], [0, -1], [0, 1], [1, 0], [1, v]];

            for dir in directions {
                let dy = y as isize + dir[0];
                let dx = x as isize + dir[1];
                let contains = map.contains_key(&format!("{}:{}", dx, dy));
                if dy >= 0 && dx >= 0 && !contains {
                    let dy = dy as usize;
                    let dx = dx as usize;
                    if dy < self.size && dx < self.size && !self.get_value(dx, dy) {
                        queue.push_back(PointWithParent {
                            point: Point::new(dx, dy),
                            parent: Some(Box::new(current.clone())),
                        });
                    }
                }
            }
        }
        None
    }
}
