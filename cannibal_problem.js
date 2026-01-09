import {NoSolutionError} from "./exceptions.js";

export function cannibal_problem(n_cannibals, n_missionaries, boat_capacity) {
    let m_key = "m"
    let c_key = "c"
    let b_key = "b"
    let initial_state = create_state (n_cannibals, n_missionaries, 0)
    let visited_states = [initial_state]


    function known_state(state){
        for (const visited_state of visited_states) {
            if (state[c_key] === visited_state[c_key]
                && state[m_key] === visited_state[m_key]
                && state[b_key] === visited_state[b_key]){
                return true
            }
        }
        return false;
    }

    function create_state(cannibals, missionaries, boat, prev_state, boat_state) {
        let state = {}
        state[c_key] =  cannibals
        state[m_key] =  missionaries
        state[b_key] = boat
        state["prev"] =  prev_state
        state["boat"] = boat_state
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
        function beach_state_to_state(beach_state,boat_state, beach, prev_state){
            switch (beach){
                case 0:
                    return create_state(beach_state[c_key], beach_state[m_key], 1, prev_state, boat_state)
                case 1:
                    return create_state(
                        initial_state[c_key] - beach_state[c_key],
                        initial_state[m_key] - beach_state[m_key],
                        0,
                        prev_state,
                        boat_state)
                default:
                    throw Error("Unrecognized beach")
            }
        }
        let state = open_states[0]
        open_states.shift()
        let missionaries
        let cannibals

        if (state === undefined){
            console.log("No solution found")
            throw new NoSolutionError("")
        }
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

        let possible_states = new_possible_beach_states(cannibals,  missionaries, boat_capacity)
        let new_states = []
        possible_states.forEach(state_list=>new_states.push(beach_state_to_state(state_list.beach_states,state_list.boat_states,beach, state)))
        new_states = new_states.filter(state=>!known_state(state))
        new_states.forEach(state=>{open_states.push(state); visited_states.push(state)})
        return solve_recusively(open_states)
    }



    function new_possible_beach_states(cannibals, missionaries, boat_capacity) {
        function inverted_beach(state){
            return create_beach_state(initial_state[c_key] - state[c_key], initial_state[m_key] - state[m_key])
        }

        function create_beach_state(cannibals, missionaries){
            let boat_state = []
            boat_state[m_key] =  missionaries
            boat_state[c_key] = cannibals
            return boat_state
        }
        function possible_boat_actions(cannibals, missionaries, boat_capacity, c_i, m_i, arr) {
            if (m_i > missionaries || m_i > boat_capacity) return arr
            if (!(m_i === 0 && c_i === 0)){
                let boat_state = create_beach_state(c_i, m_i)
                arr.push(boat_state);
            }
            if (c_i < cannibals && c_i + m_i < boat_capacity) {
                return possible_boat_actions(cannibals, missionaries, boat_capacity, c_i + 1, m_i, arr)
            } else return possible_boat_actions(cannibals, missionaries, boat_capacity, 0, m_i + 1, arr)
        }
        function missionaries_survive(state){
            let other_side = inverted_beach(state)
            return (state[m_key]>=state[c_key]|| state[m_key]===0) &&  (other_side[m_key]>=other_side[c_key] || other_side[m_key]===0)
        }
        let all_boat_actions = possible_boat_actions(cannibals, missionaries, boat_capacity, 0, 0, [])
        let new_states = all_boat_actions.map(boat =>  {return {beach_states:create_beach_state(cannibals- boat[c_key], missionaries- boat[m_key]), boat_states:boat}})
        return new_states.filter(x => missionaries_survive(x.beach_states))
    }

    function steps_as_array(state, steps){
        if (state === undefined)
            return steps
        steps.push(state)
        return steps_as_array(state["prev"], steps)
    }

    return steps_as_array(solve_recusively([initial_state]), []).reverse()
}




console.log(cannibal_problem(3,3, 2))