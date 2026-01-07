function cannibal_problem(n_cannibals, n_missionaries, boat_capacity) {
    let m_key = "m"
    let c_key = "c"
    let b_key = "b"
    let initial_state = []
    initial_state[m_key] = n_missionaries
    initial_state[c_key] = n_cannibals
    initial_state[b_key] = boat_capacity
    let state = initial_state.slice();

    function missionaries_survive(initial_state, state, m_key, c_key) {
        //check start side
        if (state[m_key] < state[c_key]) {
            return false;
        }
        let m_other_side = initial_state[m_key] - state[m_key];
        let c_other_side = initial_state[c_key] - state[c_key];
        //check other side
        if (m_other_side < c_other_side) {
            return false;
        }
        return true;
    }






    function new_possible_beach_states(cannibals, missionaries, boat_capacity) {
        function get_all_combinations(cannibals, missionaries, boat_capacity, c_i, m_i, arr) {
            if (m_i > missionaries || m_i > boat_capacity) return arr
            e = []
            e[m_key] =  m_i
            e[c_key] = c_i
            arr.push(e);
            if (c_i < cannibals && c_i < boat_capacity) {
                return get_all_combinations(cannibals, missionaries, boat_capacity, c_i + 1, m_i, arr)
            } else return get_all_combinations(cannibals, missionaries, boat_capacity, 0, m_i + 1, arr)
        }
        function missionaries_survive(state){
            return state[m_key]>=state[c_key]
        }


        let all_possible_combinations = get_all_combinations(cannibals, missionaries, boat_capacity, 0, 0, [])
        let valid_combinations = all_possible_combinations.filter(x=>missionaries_survive(x))
        console.log(valid_combinations)
    }
    new_possible_beach_states(3,3,2);

    function invert_beach_state(state, initial_state) {
        state[c_key] = initial_state[c_key] - state[c_key]
        state[m_key] = initial_state[m_key] - state[m_key]
        return state
    }

}

cannibal_problem()