use rand::Rng;

pub fn generate_random_number(min: usize, max: usize) -> usize {
    let mut rng = rand::thread_rng();
    rng.gen_range(min..max)
}
