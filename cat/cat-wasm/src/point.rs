use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Default, Clone)]
pub struct Point {
    pub x: usize,
    pub y: usize,
}

impl Point {
    pub fn new(x: usize, y: usize) -> Self {
        Self { x, y }
    }
}

#[derive(Clone)]
pub struct PointWithParent {
    pub point: Point,
    pub parent: Option<Box<PointWithParent>>,
}

impl From<Point> for PointWithParent {
    fn from(point: Point) -> Self {
        Self {
            point,
            parent: None,
        }
    }
}

impl Into<Point> for PointWithParent {
    fn into(self) -> Point {
        self.point
    }
}
