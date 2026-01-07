function cannibal_problem(n_cannibals, n_missionaries, boat_capacity) {
    let m_key = "m"
    let c_key = "c"
    let b_key = "b"
    let initial_state = create_state (n_cannibals, n_missionaries, 0)
    let visited_states = [initial_state]


    function known_state(state){
        for (let visited_state in visited_states) {
            if (state[c_key] === visited_state[c_key]
                && state[m_key] === visited_state[m_key]
                && state[b_key] === visited_state[b_key])
                return true
        }
        return false;
    }

    function create_state(cannibals, missionaries, boat, prev_state) {
        let state = {}
        state[c_key] =  cannibals
        state[m_key] =  missionaries
        state[b_key] = boat
        state["prev"] =  prev_state
        return state
    }



    function cannibals_start_beach(state){
        return state[c_key]
    }
    function missionaries_start_beach(state){
        return state[m_key]
    }
    function cannibals_goal_beach(state){
        return initial_state[c_key] - state[c_key]
    }
    function missionaries_goal_beach(state){
        return initial_state[m_key] - state[m_key]
    }
    function problem_completed(state){
       return state[m_key] === 0 && state[c_key] === 0;
    }



    function solve_recusively(open_states){
        function beach_state_to_state(beach_state, arrival_beach, prev_state){
            switch (arrival_beach){
                case 0:
                    return create_state(beach_state[c_key], beach_state[m_key], 0, prev_state)
                case 1:
                    return create_state(
                        initial_state[c_key] - beach_state[c_key],
                        initial_state[m_key] - beach_state[m_key],
                        1,
                        prev_state)
                default:
                    throw Error("Unrecognized beach")
            }
        }
        let state = open_states[0]
        open_states.shift()
        let missionaries
        let cannibals
        let beach = state[b_key]
        if (problem_completed(state)){
            return state
        }


        switch (beach){
            case 0:
                missionaries = missionaries_start_beach(state)
                cannibals = cannibals_start_beach(state)
                break
            case 1:
                missionaries = missionaries_goal_beach(state)
                cannibals = cannibals_goal_beach(state)
                break
            default:
                throw Error("Unrecognized beach")
        }

        let beach_states = new_possible_beach_states(cannibals,  missionaries, boat_capacity)
        let new_states = []
        beach_states.forEach(beach_state=>new_states.push(beach_state_to_state(beach_state,1-beach, state)))
        console.log(new_states)
        new_states.filter(state=>!known_state(state))
        new_states.forEach(state=>{open_states.push(state); visited_states.push(state)})
        console.log(open_states)
    }



    function new_possible_beach_states(cannibals, missionaries, boat_capacity) {
        function get_all_combinations(cannibals, missionaries, boat_capacity, c_i, m_i, arr) {
            if (m_i > missionaries || m_i > boat_capacity) return arr
            let beach_state = []
            beach_state[m_key] =  m_i
            beach_state[c_key] = c_i
            arr.push(beach_state);
            if (c_i < cannibals && c_i < boat_capacity) {
                return get_all_combinations(cannibals, missionaries, boat_capacity, c_i + 1, m_i, arr)
            } else return get_all_combinations(cannibals, missionaries, boat_capacity, 0, m_i + 1, arr)
        }
        function missionaries_survive(state){
            return state[m_key]>=state[c_key]
        }
        let all_possible_combinations = get_all_combinations(cannibals, missionaries, boat_capacity, 0, 0, [])
        return all_possible_combinations.filter(x => missionaries_survive(x))
    }



    return solve_recusively([initial_state])
}

console.log(cannibal_problem(3,3, 2))